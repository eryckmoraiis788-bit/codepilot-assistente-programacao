import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ASSISTANT_TASKS, PROGRAMMING_LANGUAGES } from "../shared/code-assistant";
import { buildSystemPrompt, parseAssistantResult } from "./code-assistant";
import { COOKIE_NAME } from "./../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM, listLLMModels } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const requestTimes = new Map<string, number[]>();
const REQUEST_WINDOW_MS = 60_000;
const REQUEST_LIMIT = 6;

function canRequest(clientId: string) {
  const now = Date.now();
  const recent = (requestTimes.get(clientId) ?? []).filter((time) => now - time < REQUEST_WINDOW_MS);
  if (recent.length >= REQUEST_LIMIT) return false;
  recent.push(now);
  requestTimes.set(clientId, recent);
  return true;
}

async function chooseModel() {
  const { data } = await listLLMModels();
  return data.find((model) => model.id === "gpt-5")?.id
    ?? data.find((model) => model.id === "claude-sonnet-4-6")?.id
    ?? data.find((model) => model.id.includes("mini"))?.id
    ?? data[0]?.id;
}

const requestSchema = z.object({
  prompt: z.string().trim().min(3).max(16_000),
  language: z.enum(PROGRAMMING_LANGUAGES),
  task: z.enum(ASSISTANT_TASKS),
  detailed: z.boolean().default(true),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(8_000) })).max(6).default([]),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  codeAssistant: router({
    run: publicProcedure.input(requestSchema).mutation(async ({ ctx, input }) => {
      const forwarded = ctx.req.headers["x-forwarded-for"];
      const clientId = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : ctx.req.ip || "anonymous";
      if (!canRequest(clientId)) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Aguarde um minuto antes de enviar uma nova consulta." });
      }

      const model = await chooseModel();
      if (!model) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Nenhum modelo de IA está disponível no momento." });

      try {
        const response = await invokeLLM({
          model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: buildSystemPrompt(input) },
            ...input.history.map((item) => ({ role: item.role, content: item.content })),
            { role: "user", content: input.prompt },
          ],
        });
        const content = response.choices[0]?.message.content;
        if (typeof content !== "string" || !content.trim()) {
          throw new Error("Resposta vazia do modelo");
        }
        return parseAssistantResult(content, input);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível analisar o código agora. Tente novamente." });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
