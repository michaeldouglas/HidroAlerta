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
            style={[styles.item, active && styles.itemActive]}
            onPress={() => router.push(item.path as never)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
          >
            {active ? <View style={styles.activeIndicator} /> : null}
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
    minHeight: 70,
    marginHorizontal: 10,
    marginBottom: 8,
    padding: 6,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: "rgba(8, 38, 65, 0.97)",
    borderWidth: 1,
    borderColor: "rgba(117, 200, 238, 0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  navLandscape: {
    minHeight: 56,
    marginBottom: 4,
    padding: 4,
  },
  item: {
    flex: 1,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: 16,
  },
  itemActive: {
    backgroundColor: "rgba(77, 182, 232, 0.11)",
  },
  activeIndicator: {
    position: "absolute",
    top: 2,
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.blueLight,
  },
  label: {
    color: Colors.muted,
    fontSize: 10,
    fontWeight: "600",
  },
  labelActive: {
    color: Colors.blueLight,
    fontWeight: "900",
  },
});
