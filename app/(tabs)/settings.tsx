import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useCodePilot } from "@/lib/code-pilot-store";
import { haptic } from "@/lib/haptics";
import { PROGRAMMING_LANGUAGES, type ProgrammingLanguage } from "@/shared/code-assistant";

export default function SettingsScreen() {
  const { preferences, updatePreferences, clearHistory, sessions } = useCodePilot();
  const [showLanguages, setShowLanguages] = useState(false);

  function chooseLanguage(language: ProgrammingLanguage) {
    updatePreferences({ preferredLanguage: language });
    setShowLanguages(false);
    haptic.selection();
  }

  function confirmClearHistory() {
    Alert.alert("Limpar histórico?", "As consultas salvas neste aparelho serão removidas.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Limpar", style: "destructive", onPress: () => { clearHistory(); haptic.medium(); } },
    ]);
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>PREFERÊNCIAS LOCAIS</Text>
          <Text style={styles.title}>Ajustes</Text>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Assistente</Text>
          <Pressable onPress={() => setShowLanguages((current) => !current)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <View style={styles.rowIcon}><MaterialIcons color="#2368FF" name="language" size={19} /></View>
            <View style={styles.rowCopy}><Text style={styles.rowTitle}>Linguagem padrão</Text><Text style={styles.rowDescription}>{preferences.preferredLanguage}</Text></View>
            <MaterialIcons color="#64748B" name={showLanguages ? "expand-less" : "expand-more"} size={22} />
          </Pressable>
          {showLanguages ? (
            <FlatList
              data={PROGRAMMING_LANGUAGES}
              keyExtractor={(item) => item}
              scrollEnabled={false}
              contentContainerStyle={styles.languageList}
              renderItem={({ item }) => (
                <Pressable onPress={() => chooseLanguage(item)} style={({ pressed }) => [styles.languageRow, pressed && styles.pressed]}>
                  <Text style={styles.languageText}>{item}</Text>
                  {item === preferences.preferredLanguage ? <MaterialIcons color="#2368FF" name="check" size={20} /> : null}
                </Pressable>
              )}
            />
          ) : null}
          <View style={styles.row}>
            <View style={styles.rowIcon}><MaterialIcons color="#2368FF" name="subject" size={19} /></View>
            <View style={styles.rowCopy}><Text style={styles.rowTitle}>Explicações detalhadas</Text><Text style={styles.rowDescription}>Inclui diagnóstico e próximos passos.</Text></View>
            <Switch
              accessibilityLabel="Alternar explicações detalhadas"
              onValueChange={(value) => { updatePreferences({ detailedExplanations: value }); haptic.selection(); }}
              thumbColor="#FFFFFF"
              trackColor={{ false: "#CBD5E1", true: "#2368FF" }}
              value={preferences.detailedExplanations}
            />
          </View>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Dados</Text>
          <View style={styles.row}>
            <View style={styles.rowIcon}><MaterialIcons color="#2368FF" name="phone-iphone" size={19} /></View>
            <View style={styles.rowCopy}><Text style={styles.rowTitle}>Histórico no aparelho</Text><Text style={styles.rowDescription}>{sessions.length} {sessions.length === 1 ? "consulta salva" : "consultas salvas"}</Text></View>
          </View>
          <Pressable onPress={confirmClearHistory} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <View style={[styles.rowIcon, styles.dangerIcon]}><MaterialIcons color="#B91C1C" name="delete-outline" size={19} /></View>
            <View style={styles.rowCopy}><Text style={styles.dangerTitle}>Limpar histórico</Text><Text style={styles.rowDescription}>Remove as conversas deste aparelho.</Text></View>
            <MaterialIcons color="#B91C1C" name="chevron-right" size={21} />
          </Pressable>
        </View>

        <View style={styles.privacy}>
          <MaterialIcons color="#0F6D7C" name="shield" size={19} />
          <View style={styles.privacyCopy}><Text style={styles.privacyTitle}>Privacidade e uso responsável</Text><Text style={styles.privacyText}>O histórico fica no dispositivo. O conteúdo enviado para análise é processado para gerar a resposta e não substitui testes, revisão de código ou validação de segurança.</Text></View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18, paddingBottom: 28, paddingHorizontal: 20, paddingTop: 14 },
  header: { gap: 2 },
  eyebrow: { color: "#2368FF", fontSize: 10, fontWeight: "900", letterSpacing: 0.9 },
  title: { color: "#172A63", fontSize: 27, fontWeight: "800", letterSpacing: -0.5 },
  group: { backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: 19, borderWidth: 1, overflow: "hidden" },
  groupTitle: { color: "#64748B", fontSize: 11, fontWeight: "900", letterSpacing: 0.75, paddingHorizontal: 14, paddingTop: 14 },
  row: { alignItems: "center", borderBottomColor: "#EEF2F7", borderBottomWidth: 1, flexDirection: "row", gap: 11, minHeight: 74, paddingHorizontal: 14 },
  rowIcon: { alignItems: "center", backgroundColor: "#EAF0FF", borderRadius: 10, height: 37, justifyContent: "center", width: 37 },
  rowCopy: { flex: 1, gap: 2 },
  rowTitle: { color: "#172A63", fontSize: 15, fontWeight: "800" },
  rowDescription: { color: "#64748B", fontSize: 12, lineHeight: 17 },
  languageList: { backgroundColor: "#F8FAFC", paddingBottom: 6 },
  languageRow: { alignItems: "center", borderBottomColor: "#E2E8F0", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 42, paddingHorizontal: 16 },
  languageText: { color: "#334155", fontSize: 14, fontWeight: "700" },
  dangerIcon: { backgroundColor: "#FEF2F2" },
  dangerTitle: { color: "#B91C1C", fontSize: 15, fontWeight: "800" },
  privacy: { alignItems: "flex-start", backgroundColor: "#E6F8FB", borderColor: "#B7E7EF", borderRadius: 17, borderWidth: 1, flexDirection: "row", gap: 10, padding: 14 },
  privacyCopy: { flex: 1, gap: 4 },
  privacyTitle: { color: "#0F5562", fontSize: 14, fontWeight: "800" },
  privacyText: { color: "#0F6D7C", fontSize: 12, lineHeight: 18 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
