import type { AssistantResult, AssistantTask, ProgrammingLanguage } from "../shared/code-assistant";

type ResultInput = {
  language: ProgrammingLanguage;
  task: AssistantTask;
  detailed: boolean;
};

const fallbackCaution = "Revise e teste a sugestão no seu projeto antes de adotá-la em produção.";

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 12_000) : fallback;
}

function textList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 6);
}

export function buildSystemPrompt(input: ResultInput) {
  return `Você é CodePilot, um assistente de programação preciso e didático. Responda em português brasileiro, exceto quando o usuário pedir explicitamente outro idioma.

Tarefa selecionada: ${input.task}. Linguagem principal: ${input.language}. Profundidade solicitada: ${input.detailed ? "detalhada, incluindo diagnóstico e etapas de validação" : "direta e resumida, mantendo apenas o essencial"}.

Analise apenas o contexto fornecido. Não afirme que executou, compilou, testou ou acessou arquivos que não foram enviados. Quando não houver informação suficiente, declare a hipótese e peça o detalhe técnico necessário. Para trechos de código, mantenha a solução focada, segura e compatível com a linguagem escolhida.

Retorne exclusivamente um objeto JSON válido, sem cercas Markdown, com este formato:
{
  "title": "título curto",
  "overview": "resumo direto",
  "diagnosis": "causa ou análise; use texto vazio se não se aplicar",
  "solution": "explicação objetiva da abordagem",
  "code": "código sem cercas Markdown; use texto vazio se não houver código",
  "testPlan": ["passo de validação"],
  "nextSteps": ["próximo passo"],
  "caution": "limitação, risco ou lembrete de validação"
}`;
}

export function normalizeAssistantResult(raw: unknown, input: ResultInput): AssistantResult {
  const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const overview = text(value.overview, "Não foi possível estruturar uma resposta completa. Tente incluir mais contexto técnico.");

  return {
    title: text(value.title, `${input.task} em ${input.language}`),
    overview,
    diagnosis: text(value.diagnosis),
    solution: text(value.solution, "Revise o contexto e aplique a solução gradualmente."),
    code: text(value.code),
    testPlan: textList(value.testPlan),
    nextSteps: textList(value.nextSteps),
    caution: text(value.caution, fallbackCaution),
  };
}

export function parseAssistantResult(content: string, input: ResultInput): AssistantResult {
  try {
    return normalizeAssistantResult(JSON.parse(content), input);
  } catch {
    return normalizeAssistantResult({ overview: content }, input);
  }
}
