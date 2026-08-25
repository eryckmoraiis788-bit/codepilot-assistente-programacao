import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { haptic } from "@/lib/haptics";

type CodeBlockProps = {
  code: string;
  language: string;
};

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    haptic.success();
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.language}>{language}</Text>
        <Pressable
          accessibilityLabel="Copiar código"
          accessibilityRole="button"
          onPress={copyCode}
          style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}
        >
          <MaterialIcons color="#C7D2FE" name={copied ? "check" : "content-copy"} size={16} />
          <Text style={styles.copyText}>{copied ? "Copiado" : "Copiar"}</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.codeContent}>
        <Text selectable style={styles.code}>
          {code}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#111827",
    borderColor: "#26334D",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    backgroundColor: "#172036",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  language: { color: "#93C5FD", fontFamily: "monospace", fontSize: 12, fontWeight: "700" },
  copyButton: { alignItems: "center", flexDirection: "row", gap: 5, minHeight: 32, paddingHorizontal: 4 },
  copyText: { color: "#C7D2FE", fontSize: 12, fontWeight: "700" },
  codeContent: { minWidth: "100%", padding: 14 },
  code: { color: "#E5E7EB", fontFamily: "monospace", fontSize: 13, lineHeight: 20 },
  pressed: { opacity: 0.65 },
});
