import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type {
  AssistantResult,
  AssistantTask,
  CodePilotPreferences,
  CodeSession,
  ProgrammingLanguage,
} from "@/shared/code-assistant";

const STORAGE_KEY = "@codepilot/workspace:v1";

const defaultPreferences: CodePilotPreferences = {
  preferredLanguage: "TypeScript",
  detailedExplanations: true,
};

type StoredWorkspace = {
  sessions: CodeSession[];
  preferences: CodePilotPreferences;
};

type NewSessionInput = {
  prompt: string;
  language: ProgrammingLanguage;
  task: AssistantTask;
  result: AssistantResult;
};

type CodePilotContextValue = {
  sessions: CodeSession[];
  preferences: CodePilotPreferences;
  isReady: boolean;
  createSession: (input: NewSessionInput) => string;
  appendTurn: (sessionId: string, prompt: string, result: AssistantResult) => void;
  deleteSession: (sessionId: string) => void;
  clearHistory: () => void;
  updatePreferences: (next: Partial<CodePilotPreferences>) => void;
};

const CodePilotContext = createContext<CodePilotContextValue | null>(null);

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildTitle(prompt: string) {
  const compact = prompt.replace(/\s+/g, " ").trim();
  return compact.length > 46 ? `${compact.slice(0, 46)}…` : compact || "Nova consulta";
}

export function CodePilotProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<CodeSession[]>([]);
  const [preferences, setPreferences] = useState<CodePilotPreferences>(defaultPreferences);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadWorkspace() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw || !mounted) return;
        const parsed = JSON.parse(raw) as Partial<StoredWorkspace>;
        if (Array.isArray(parsed.sessions)) setSessions(parsed.sessions);
        if (parsed.preferences) setPreferences({ ...defaultPreferences, ...parsed.preferences });
      } catch {
        // A falha de leitura não deve bloquear uma nova consulta de código.
      } finally {
        if (mounted) setIsReady(true);
      }
    }

    void loadWorkspace();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const workspace: StoredWorkspace = { sessions, preferences };
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  }, [isReady, preferences, sessions]);

  const createSession = useCallback((input: NewSessionInput) => {
    const now = new Date().toISOString();
    const session: CodeSession = {
      id: makeId("session"),
      title: buildTitle(input.prompt),
      language: input.language,
      task: input.task,
      createdAt: now,
      updatedAt: now,
      messages: [
        { id: makeId("message"), role: "user", content: input.prompt, createdAt: now },
        {
          id: makeId("message"),
          role: "assistant",
          content: input.result.overview,
          result: input.result,
          createdAt: now,
        },
      ],
    };
    setSessions((current) => [session, ...current]);
    return session.id;
  }, []);

  const appendTurn = useCallback((sessionId: string, prompt: string, result: AssistantResult) => {
    const now = new Date().toISOString();
    setSessions((current) =>
      current
        .map((session) =>
          session.id === sessionId
            ? (() => {
                const messages: CodeSession["messages"] = [
                  ...session.messages,
                  { id: makeId("message"), role: "user", content: prompt, createdAt: now },
                  {
                    id: makeId("message"),
                    role: "assistant",
                    content: result.overview,
                    result,
                    createdAt: now,
                  },
                ];
                return {
                  ...session,
                  title: session.messages.length <= 2 ? buildTitle(prompt) : session.title,
                  updatedAt: now,
                  messages,
                };
              })()
            : session,
        )
        .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt)),
    );
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((current) => current.filter((session) => session.id !== sessionId));
  }, []);

  const clearHistory = useCallback(() => setSessions([]), []);

  const updatePreferences = useCallback((next: Partial<CodePilotPreferences>) => {
    setPreferences((current) => ({ ...current, ...next }));
  }, []);

  const value = useMemo(
    () => ({
      sessions,
      preferences,
      isReady,
      createSession,
      appendTurn,
      deleteSession,
      clearHistory,
      updatePreferences,
    }),
    [appendTurn, clearHistory, createSession, deleteSession, isReady, preferences, sessions, updatePreferences],
  );

  return <CodePilotContext.Provider value={value}>{children}</CodePilotContext.Provider>;
}

export function useCodePilot() {
  const context = useContext(CodePilotContext);
  if (!context) throw new Error("useCodePilot deve ser usado dentro de CodePilotProvider");
  return context;
}
