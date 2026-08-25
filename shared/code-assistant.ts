export const PROGRAMMING_LANGUAGES = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Java",
  "C#",
  "C++",
  "C",
  "PHP",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "SQL",
  "HTML/CSS",
] as const;

export const ASSISTANT_TASKS = ["Criar", "Corrigir", "Explicar", "Revisar", "Testar"] as const;

export type ProgrammingLanguage = (typeof PROGRAMMING_LANGUAGES)[number];
export type AssistantTask = (typeof ASSISTANT_TASKS)[number];

export type AssistantResult = {
  title: string;
  overview: string;
  diagnosis: string;
  solution: string;
  code: string;
  testPlan: string[];
  nextSteps: string[];
  caution: string;
};

export type CodeMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  result?: AssistantResult;
};

export type CodeSession = {
  id: string;
  title: string;
  language: ProgrammingLanguage;
  task: AssistantTask;
  createdAt: string;
  updatedAt: string;
  messages: CodeMessage[];
};

export type CodePilotPreferences = {
  preferredLanguage: ProgrammingLanguage;
  detailedExplanations: boolean;
};
