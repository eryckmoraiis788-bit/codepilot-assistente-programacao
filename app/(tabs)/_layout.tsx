import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { CodePilotProvider } from "@/lib/code-pilot-store";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <CodePilotProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.tint,
          tabBarButton: HapticTab,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            paddingTop: 8,
            paddingBottom: bottomPadding,
            height: tabBarHeight,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            borderTopWidth: 0.5,
          },
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Início", tabBarIcon: ({ color }) => <IconSymbol size={25} name="house.fill" color={color} /> }} />
        <Tabs.Screen name="assistant" options={{ title: "Assistente", tabBarIcon: ({ color }) => <IconSymbol size={25} name="terminal.fill" color={color} /> }} />
        <Tabs.Screen name="history" options={{ title: "Histórico", tabBarIcon: ({ color }) => <IconSymbol size={25} name="clock.arrow.circlepath" color={color} /> }} />
        <Tabs.Screen name="settings" options={{ title: "Ajustes", tabBarIcon: ({ color }) => <IconSymbol size={25} name="gearshape.fill" color={color} /> }} />
      </Tabs>
    </CodePilotProvider>
  );
}
