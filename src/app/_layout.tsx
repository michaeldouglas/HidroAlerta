import { DarkTheme, Stack, ThemeProvider, usePathname } from "expo-router";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "@/shared/components/app-header";
import { AppBottomNav } from "@/shared/components/app-bottom-nav";
import { Colors } from "@/shared/constants/colors";
import { RefreshIntervalProvider } from "@/shared/contexts/refresh-interval-context";
import { TankDetailAccessProvider } from "@/shared/contexts/tank-detail-access-context";
import { SettingsProvider } from "@/features/settings/context/settings-context";

export default function RootLayout() {
  const pathname = usePathname();
  const hasOwnHeader =
    ["/nivel-caixa", "/ph", "/turbidez", "/temperatura", "/sobre", "/assistente"].includes(pathname) ||
    pathname.startsWith("/configuracoes");

  return (
    <ThemeProvider value={DarkTheme}>
      <RefreshIntervalProvider>
        <TankDetailAccessProvider>
          <SettingsProvider>
            <SafeAreaView style={styles.safeArea}>
              <StatusBar barStyle="light-content" />
              {!hasOwnHeader && <AppHeader />}
              <View style={styles.content}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: "fade_from_bottom",
                    animationDuration: 260,
                    contentStyle: { backgroundColor: Colors.navy },
                  }}
                />
              </View>
              <AppBottomNav />
            </SafeAreaView>
          </SettingsProvider>
        </TankDetailAccessProvider>
      </RefreshIntervalProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  content: {
    flex: 1,
  },
});
