import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useCodePilot } from "@/lib/code-pilot-store";
import { haptic } from "@/lib/haptics";
import type { CodeSession } from "@/shared/code-assistant";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(value));
}

export default function HistoryScreen() {
  const router = useRouter();
  const { sessions, isReady, deleteSession } = useCodePilot();

  function openSession(session: CodeSession) {
    haptic.light();
    router.push({ pathname: "/assistant" as any, params: { sessionId: session.id } });
  }

  function removeSession(id: string) {
    haptic.medium();
    deleteSession(id);
  }

  if (!isReady) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator color="#2368FF" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        contentContainerStyle={[styles.content, sessions.length === 0 && styles.emptyContent]}
        data={sessions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<View style={styles.header}><Text style={styles.eyebrow}>CONSULTAS SALVAS NO APARELHO</Text><Text style={styles.title}>Histórico</Text></View>}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><MaterialIcons color="#2368FF" name="history" size={26} /></View>
            <Text style={styles.emptyTitle}>Ainda não há consultas</Text>
            <Text style={styles.emptyText}>As conversas que você iniciar com o assistente aparecerão aqui.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Pressable onPress={() => openSession(item)} style={({ pressed }) => [styles.session, pressed && styles.pressed]}>
              <View style={styles.sessionIcon}><MaterialIcons color="#2368FF" name="code" size={19} /></View>
              <View style={styles.sessionCopy}>
                <Text numberOfLines={2} style={styles.sessionTitle}>{item.title}</Text>
                <Text style={styles.sessionMeta}>{item.language} · {item.task} · {formatDate(item.updatedAt)}</Text>
              </View>
              <MaterialIcons color="#94A3B8" name="chevron-right" size={21} />
            </Pressable>
            <Pressable accessibilityLabel="Excluir consulta" onPress={() => removeSession(item.id)} style={({ pressed }) => [styles.delete, pressed && styles.pressed]}>
              <MaterialIcons color="#B91C1C" name="delete-outline" size={20} />
            </Pressable>
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 10, paddingBottom: 26, paddingHorizontal: 20, paddingTop: 14 },
  emptyContent: { flexGrow: 1 },
  header: { gap: 2, marginBottom: 8 },
  eyebrow: { color: "#2368FF", fontSize: 10, fontWeight: "900", letterSpacing: 0.9 },
  title: { color: "#172A63", fontSize: 27, fontWeight: "800", letterSpacing: -0.5 },
  row: { alignItems: "center", flexDirection: "row", gap: 8 },
  session: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: 17, borderWidth: 1, flex: 1, flexDirection: "row", gap: 10, minHeight: 76, paddingHorizontal: 12 },
  sessionIcon: { alignItems: "center", backgroundColor: "#EAF0FF", borderRadius: 11, height: 38, justifyContent: "center", width: 38 },
  sessionCopy: { flex: 1, gap: 3 },
  sessionTitle: { color: "#172A63", fontSize: 14, fontWeight: "800", lineHeight: 19 },
  sessionMeta: { color: "#64748B", fontSize: 11.5 },
  delete: { alignItems: "center", backgroundColor: "#FEF2F2", borderRadius: 13, height: 48, justifyContent: "center", width: 42 },
  empty: { alignItems: "center", flex: 1, gap: 10, justifyContent: "center", paddingBottom: 100, paddingHorizontal: 35 },
  emptyIcon: { alignItems: "center", backgroundColor: "#EAF0FF", borderRadius: 18, height: 62, justifyContent: "center", width: 62 },
  emptyTitle: { color: "#172A63", fontSize: 18, fontWeight: "800" },
  emptyText: { color: "#64748B", fontSize: 14, lineHeight: 20, textAlign: "center" },
  pressed: { opacity: 0.68, transform: [{ scale: 0.98 }] },
});
