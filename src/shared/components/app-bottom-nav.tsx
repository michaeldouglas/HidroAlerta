import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { AppIcon } from "@/shared/components/app-icon";
import { Colors } from "@/shared/constants/colors";

const items = [
  { label: "Início", path: "/", icon: "home" },
  { label: "Histórico", path: "/historico", icon: "history" },
  { label: "Alertas", path: "/alertas", icon: "notification" },
  { label: "Conversar", path: "/assistente", icon: "hydroBot" },
  { label: "Mais", path: "/configuracoes", icon: "more" },
] as const;

export function AppBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <View style={[styles.nav, isLandscape && styles.navLandscape]}>
      {items.map((item) => {
        const active =
          pathname === item.path ||
          (item.path === "/configuracoes" &&
            (pathname.startsWith("/configuracoes") || pathname === "/sobre"));
        return (
          <Pressable
            key={item.path}
            style={styles.item}
            onPress={() => router.push(item.path as never)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <AppIcon
              name={item.icon}
              color={active ? Colors.blueLight : Colors.muted}
              size={isLandscape ? 20 : 22}
            />
            <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    minHeight: 66,
    paddingHorizontal: 8,
    paddingTop: 7,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.navySoft,
    borderTopWidth: 1,
    borderTopColor: "rgba(156, 199, 223, 0.3)",
  },
  navLandscape: {
    minHeight: 54,
    paddingTop: 4,
  },
  item: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  label: {
    color: Colors.muted,
    fontSize: 10,
    fontWeight: "600",
  },
  labelActive: {
    color: Colors.blueLight,
    fontWeight: "800",
  },
});
