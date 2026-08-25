import { describe, expect, it } from "vitest";

import { buildSystemPrompt, normalizeAssistantResult, parseAssistantResult } from "../server/code-assistant";

describe("utilitários do CodePilot", () => {
  const input = { language: "TypeScript" as const, task: "Corrigir" as const, detailed: true };

  it("inclui a linguagem e o tipo de tarefa no prompt de sistema", () => {
    const prompt = buildSystemPrompt(input);
    expect(prompt).toContain("Corrigir");
    expect(prompt).toContain("TypeScript");
    expect(prompt).toContain("detalhada");
    expect(prompt).toContain("objeto JSON válido");
  });

  it("normaliza listas e preenche campos essenciais", () => {
    const result = normalizeAssistantResult(
      {
        title: "Falha de tipo",
        overview: "A variável pode ser indefinida.",
        testPlan: ["Executar testes", 42, "Validar cenário vazio"],
        nextSteps: ["Aplicar alteração"],
      },
      input,
    );

    expect(result.testPlan).toEqual(["Executar testes", "Validar cenário vazio"]);
    expect(result.solution).toContain("Revise o contexto");
    expect(result.caution).toContain("Revise e teste");
  });

  it("preserva uma resposta não JSON como resumo útil", () => {
    const result = parseAssistantResult("Use uma verificação antes de acessar o valor.", input);
    expect(result.overview).toContain("verificação");
    expect(result.title).toContain("Corrigir");
  });
});
