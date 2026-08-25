import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useCodePilot } from "@/lib/code-pilot-store";
import { haptic } from "@/lib/haptics";
import type { AssistantTask } from "@/shared/code-assistant";

type QuickActionProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  tint: string;
  onPress: () => void;
};

function QuickAction({ icon, title, description, tint, onPress }: QuickActionProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
      <View style={[styles.actionIcon, { backgroundColor: tint }]}>
        <MaterialIcons color="#FFFFFF" name={icon} size={20} />
      </View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <MaterialIcons color="#94A3B8" name="chevron-right" size={22} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { sessions, isReady } = useCodePilot();
  const latestSession = sessions[0];

  function start(task: AssistantTask) {
    haptic.light();
    router.push({ pathname: "/assistant" as any, params: { task } });
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <MaterialIcons color="#FFFFFF" name="terminal" size={22} />
            </View>
            <Text style={styles.brand}>CODEPILOT</Text>
          </View>
          <Text style={styles.heroTitle}>Seu copiloto para criar, entender e corrigir código.</Text>
          <Text style={styles.heroDescription}>
            Descreva o que precisa, cole seu trecho de código ou envie a mensagem de erro.
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelEyebrow}>COMEÇAR UMA CONSULTA</Text>
          <QuickAction icon="auto-awesome" title="Criar código" description="Transforme uma ideia em uma solução." tint="#2368FF" onPress={() => start("Criar")} />
          <QuickAction icon="bug-report" title="Corrigir um erro" description="Entenda a causa e veja uma correção." tint="#DC2626" onPress={() => start("Corrigir")} />
          <QuickAction icon="lightbulb" title="Explicar um trecho" description="Aprenda cada parte com clareza." tint="#0F9FB5" onPress={() => start("Explicar")} />
        </View>

        {isReady && latestSession ? (
          <Pressable
            onPress={() => router.push({ pathname: "/assistant" as any, params: { sessionId: latestSession.id } })}
            style={({ pressed }) => [styles.resume, pressed && styles.pressed]}
          >
            <View style={styles.resumeIcon}>
              <MaterialIcons color="#2368FF" name="history" size={19} />
            </View>
            <View style={styles.resumeCopy}>
              <Text style={styles.resumeLabel}>CONTINUAR DE ONDE PAROU</Text>
              <Text numberOfLines={1} style={styles.resumeTitle}>{latestSession.title}</Text>
              <Text style={styles.resumeMeta}>{latestSession.language} · {latestSession.task}</Text>
            </View>
            <MaterialIcons color="#2368FF" name="arrow-forward" size={20} />
          </Pressable>
        ) : null}

        <View style={styles.notice}>
          <MaterialIcons color="#52637F" name="privacy-tip" size={18} />
          <Text style={styles.noticeText}>O histórico é salvo no seu aparelho. Revise e teste sugestões antes de usá-las em produção.</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20, paddingBottom: 32, paddingHorizontal: 20, paddingTop: 14 },
  hero: { gap: 10, paddingTop: 8 },
  brandRow: { alignItems: "center", flexDirection: "row", gap: 8 },
  logoMark: { alignItems: "center", backgroundColor: "#172A63", borderRadius: 10, height: 34, justifyContent: "center", width: 34 },
  brand: { color: "#172A63", fontSize: 13, fontWeight: "900", letterSpacing: 1.4 },
  heroTitle: { color: "#172A63", fontSize: 30, fontWeight: "800", letterSpacing: -0.6, lineHeight: 36 },
  heroDescription: { color: "#64748B", fontSize: 15, lineHeight: 22 },
  panel: { backgroundColor: "#F5F7FC", borderColor: "#E2E8F0", borderRadius: 22, borderWidth: 1, gap: 6, padding: 14 },
  panelEyebrow: { color: "#64748B", fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginBottom: 3, paddingHorizontal: 4 },
  action: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: 17, borderWidth: 1, flexDirection: "row", gap: 12, minHeight: 78, paddingHorizontal: 13 },
  actionIcon: { alignItems: "center", borderRadius: 13, height: 42, justifyContent: "center", width: 42 },
  actionCopy: { flex: 1, gap: 3 },
  actionTitle: { color: "#172A63", fontSize: 16, fontWeight: "800" },
  actionDescription: { color: "#64748B", fontSize: 13, lineHeight: 18 },
  resume: { alignItems: "center", backgroundColor: "#EAF0FF", borderColor: "#BED0FF", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 11, padding: 14 },
  resumeIcon: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 10, height: 36, justifyContent: "center", width: 36 },
  resumeCopy: { flex: 1, gap: 2 },
  resumeLabel: { color: "#2368FF", fontSize: 10, fontWeight: "900", letterSpacing: 0.7 },
  resumeTitle: { color: "#172A63", fontSize: 14, fontWeight: "800" },
  resumeMeta: { color: "#52637F", fontSize: 12 },
  notice: { alignItems: "flex-start", flexDirection: "row", gap: 8, paddingHorizontal: 5, paddingVertical: 5 },
  noticeText: { color: "#64748B", flex: 1, fontSize: 12, lineHeight: 18 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
