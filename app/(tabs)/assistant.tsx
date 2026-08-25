import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AssistantResponseCard } from "@/components/assistant-response-card";
import { ScreenContainer } from "@/components/screen-container";
import { useCodePilot } from "@/lib/code-pilot-store";
import { haptic } from "@/lib/haptics";
import { trpc } from "@/lib/trpc";
import { ASSISTANT_TASKS, PROGRAMMING_LANGUAGES, type AssistantTask, type ProgrammingLanguage } from "@/shared/code-assistant";

export default function AssistantScreen() {
  const params = useLocalSearchParams<{ task?: string; sessionId?: string }>();
  const { sessions, preferences, createSession, appendTurn } = useCodePilot();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(params.sessionId ?? null);
  const [language, setLanguage] = useState<ProgrammingLanguage>(preferences.preferredLanguage);
  const [task, setTask] = useState<AssistantTask>(ASSISTANT_TASKS.includes(params.task as AssistantTask) ? (params.task as AssistantTask) : "Criar");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const runAssistant = trpc.codeAssistant.run.useMutation();

  const activeSession = useMemo(() => sessions.find((session) => session.id === activeSessionId), [activeSessionId, sessions]);
  const latestResult = useMemo(
    () => activeSession?.messages.slice().reverse().find((message) => message.result)?.result,
    [activeSession],
  );

  useEffect(() => {
    if (params.sessionId) setActiveSessionId(params.sessionId);
  }, [params.sessionId]);

  useEffect(() => {
    if (!activeSession) return;
    setLanguage(activeSession.language);
    setTask(activeSession.task);
  }, [activeSession]);

  async function pasteFromClipboard() {
    try {
      const text = await Clipboard.getStringAsync();
      if (text.trim()) {
        setPrompt((current) => (current ? `${current}\n\n${text}` : text));
        haptic.light();
      } else {
        setError("A área de transferência não contém texto para colar.");
      }
    } catch {
      setError("Não foi possível acessar a área de transferência.");
    }
  }

  async function submit() {
    const message = prompt.trim();
    if (message.length < 3) {
      setError("Descreva a necessidade ou cole um trecho de código antes de enviar.");
      return;
    }

    setError("");
    haptic.light();
    try {
      const history = activeSession
        ? activeSession.messages.slice(-6).map((item) => ({ role: item.role, content: item.content }))
        : [];
      const result = await runAssistant.mutateAsync({
        prompt: message,
        language,
        task,
        detailed: preferences.detailedExplanations,
        history,
      });
      const nextSessionId = activeSessionId ?? createSession({ prompt: message, language, task, result });
      if (activeSessionId) appendTurn(activeSessionId, message, result);
      setActiveSessionId(nextSessionId);
      setPrompt("");
      haptic.success();
    } catch {
      setError("Não foi possível concluir a análise agora. Confira sua conexão e tente novamente.");
      haptic.error();
    }
  }

  function startNewConversation() {
    setActiveSessionId(null);
    setPrompt("");
    setError("");
    haptic.light();
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>ASSISTENTE DE PROGRAMAÇÃO</Text>
              <Text style={styles.title}>{activeSession ? "Continue sua análise" : "Em que posso ajudar?"}</Text>
            </View>
            {activeSession ? (
              <Pressable accessibilityLabel="Nova consulta" onPress={startNewConversation} style={({ pressed }) => [styles.newButton, pressed && styles.pressed]}>
                <MaterialIcons color="#2368FF" name="add" size={20} />
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.sectionLabel}>TIPO DE TAREFA</Text>
          <FlatList
            horizontal
            data={ASSISTANT_TASKS}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            renderItem={({ item }) => (
              <Pressable onPress={() => { setTask(item); haptic.selection(); }} style={({ pressed }) => [styles.chip, task === item && styles.chipActive, pressed && styles.pressed]}>
                <Text style={[styles.chipText, task === item && styles.chipTextActive]}>{item}</Text>
              </Pressable>
            )}
          />

          <Text style={styles.sectionLabel}>LINGUAGEM</Text>
          <FlatList
            horizontal
            data={PROGRAMMING_LANGUAGES}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            renderItem={({ item }) => (
              <Pressable onPress={() => { setLanguage(item); haptic.selection(); }} style={({ pressed }) => [styles.chip, language === item && styles.chipActive, pressed && styles.pressed]}>
                <Text style={[styles.chipText, language === item && styles.chipTextActive]}>{item}</Text>
              </Pressable>
            )}
          />

          <View style={styles.editorCard}>
            <View style={styles.editorHeader}>
              <View style={styles.editorTitleRow}>
                <MaterialIcons color="#2368FF" name="code" size={19} />
                <Text style={styles.editorTitle}>Sua solicitação</Text>
              </View>
              <Pressable accessibilityLabel="Colar conteúdo" onPress={pasteFromClipboard} style={({ pressed }) => [styles.pasteButton, pressed && styles.pressed]}>
                <MaterialIcons color="#2368FF" name="content-paste" size={16} />
                <Text style={styles.pasteText}>Colar</Text>
              </Pressable>
            </View>
            <TextInput
              accessibilityLabel="Descreva o código ou erro"
              multiline
              maxLength={16000}
              onChangeText={setPrompt}
              placeholder="Ex.: este componente TypeScript falha quando a lista está vazia. Explique o erro e sugira a correção."
              placeholderTextColor="#94A3B8"
              style={styles.input}
              textAlignVertical="top"
              value={prompt}
            />
            <View style={styles.editorFooter}>
              <Text style={styles.counter}>{prompt.length}/16000</Text>
              <Pressable
                accessibilityLabel="Enviar para análise"
                disabled={runAssistant.isPending}
                onPress={submit}
                style={({ pressed }) => [styles.submitButton, runAssistant.isPending && styles.submitDisabled, pressed && !runAssistant.isPending && styles.pressed]}
              >
                {runAssistant.isPending ? <ActivityIndicator color="#FFFFFF" size="small" /> : <MaterialIcons color="#FFFFFF" name="arrow-upward" size={20} />}
                <Text style={styles.submitText}>{runAssistant.isPending ? "Analisando" : "Enviar"}</Text>
              </Pressable>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <MaterialIcons color="#B91C1C" name="error-outline" size={18} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {latestResult ? <AssistantResponseCard language={language} result={latestResult} /> : null}
          <Text style={styles.disclaimer}>As sugestões são uma análise técnica; valide o código e suas dependências no ambiente do projeto.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: 13, paddingBottom: 28, paddingHorizontal: 20, paddingTop: 12 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  eyebrow: { color: "#2368FF", fontSize: 10, fontWeight: "900", letterSpacing: 0.9 },
  title: { color: "#172A63", fontSize: 25, fontWeight: "800", letterSpacing: -0.4, lineHeight: 31 },
  newButton: { alignItems: "center", backgroundColor: "#EAF0FF", borderRadius: 12, height: 42, justifyContent: "center", width: 42 },
  sectionLabel: { color: "#64748B", fontSize: 10, fontWeight: "900", letterSpacing: 0.85, marginTop: 4 },
  chips: { gap: 8, paddingRight: 16 },
  chip: { backgroundColor: "#F1F5F9", borderColor: "#E2E8F0", borderRadius: 18, borderWidth: 1, minHeight: 36, paddingHorizontal: 13, justifyContent: "center" },
  chipActive: { backgroundColor: "#EAF0FF", borderColor: "#2368FF" },
  chipText: { color: "#52637F", fontSize: 13, fontWeight: "700" },
  chipTextActive: { color: "#1749B9" },
  editorCard: { backgroundColor: "#FFFFFF", borderColor: "#C9D5EC", borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  editorHeader: { alignItems: "center", borderBottomColor: "#E2E8F0", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
  editorTitleRow: { alignItems: "center", flexDirection: "row", gap: 7 },
  editorTitle: { color: "#172A63", fontSize: 15, fontWeight: "800" },
  pasteButton: { alignItems: "center", flexDirection: "row", gap: 4, minHeight: 32, paddingHorizontal: 3 },
  pasteText: { color: "#2368FF", fontSize: 13, fontWeight: "800" },
  input: { color: "#172A63", fontFamily: "monospace", fontSize: 14, lineHeight: 20, minHeight: 168, padding: 14 },
  editorFooter: { alignItems: "center", borderTopColor: "#E2E8F0", borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", padding: 10 },
  counter: { color: "#94A3B8", fontSize: 11 },
  submitButton: { alignItems: "center", backgroundColor: "#2368FF", borderRadius: 13, flexDirection: "row", gap: 6, minHeight: 42, paddingHorizontal: 15 },
  submitDisabled: { backgroundColor: "#7FA5FF" },
  submitText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  errorBox: { alignItems: "flex-start", backgroundColor: "#FEF2F2", borderColor: "#FECACA", borderRadius: 13, borderWidth: 1, flexDirection: "row", gap: 8, padding: 12 },
  errorText: { color: "#991B1B", flex: 1, fontSize: 13, lineHeight: 19 },
  disclaimer: { color: "#64748B", fontSize: 12, lineHeight: 18, paddingHorizontal: 3, textAlign: "center" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
