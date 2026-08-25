import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, Text, View } from "react-native";

import { CodeBlock } from "@/components/code-block";
import type { AssistantResult } from "@/shared/code-assistant";

type AssistantResponseCardProps = {
  result: AssistantResult;
  language: string;
};

function DetailSection({ icon, title, text }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; text: string }) {
  if (!text) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <MaterialIcons color="#2368FF" name={icon} size={18} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionText}>{text}</Text>
    </View>
  );
}

export function AssistantResponseCard({ result, language }: AssistantResponseCardProps) {
  const tests = result.testPlan.length ? `• ${result.testPlan.join("\n• ")}` : "";
  const nextSteps = result.nextSteps.length ? `• ${result.nextSteps.join("\n• ")}` : "";

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.aiIcon}>
          <MaterialIcons color="#FFFFFF" name="auto-awesome" size={18} />
        </View>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>ANÁLISE DO CODEPILOT</Text>
          <Text style={styles.title}>{result.title}</Text>
        </View>
      </View>

      <Text style={styles.overview}>{result.overview}</Text>
      <DetailSection icon="bug-report" title="Diagnóstico" text={result.diagnosis} />
      <DetailSection icon="lightbulb" title="Solução sugerida" text={result.solution} />
      {result.code ? <CodeBlock code={result.code} language={language} /> : null}
      <DetailSection icon="fact-check" title="Como validar" text={tests} />
      <DetailSection icon="arrow-forward" title="Próximos passos" text={nextSteps} />
      {result.caution ? (
        <View style={styles.caution}>
          <MaterialIcons color="#B45309" name="info-outline" size={17} />
          <Text style={styles.cautionText}>{result.caution}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#FFFFFF", borderColor: "#DCE3F0", borderRadius: 22, borderWidth: 1, gap: 16, padding: 18 },
  topRow: { alignItems: "center", flexDirection: "row", gap: 10 },
  aiIcon: { alignItems: "center", backgroundColor: "#2368FF", borderRadius: 11, height: 38, justifyContent: "center", width: 38 },
  heading: { flex: 1 },
  eyebrow: { color: "#2368FF", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  title: { color: "#172A63", fontSize: 18, fontWeight: "800", lineHeight: 23 },
  overview: { color: "#334155", fontSize: 15, lineHeight: 22 },
  section: { gap: 6 },
  sectionTitleRow: { alignItems: "center", flexDirection: "row", gap: 7 },
  sectionTitle: { color: "#172A63", fontSize: 15, fontWeight: "800" },
  sectionText: { color: "#475569", fontSize: 14, lineHeight: 21 },
  caution: { alignItems: "flex-start", backgroundColor: "#FFF7E6", borderRadius: 12, flexDirection: "row", gap: 8, padding: 11 },
  cautionText: { color: "#92400E", flex: 1, fontSize: 13, lineHeight: 19 },
});
