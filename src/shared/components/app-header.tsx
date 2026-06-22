import { useState } from "react";
import { usePathname, useRouter } from "expo-router";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/shared/constants/colors";
import { AppIcon } from "@/shared/components/app-icon";
import {
  type RefreshIntervalSeconds,
  useRefreshInterval,
} from "@/shared/contexts/refresh-interval-context";

const refreshOptions: RefreshIntervalSeconds[] = [2, 5, 10, 15, 20];

const mainRoutes = [
  { label: "Início", path: "/", icon: "home" },
  { label: "Histórico", path: "/historico", icon: "history" },
  { label: "Alertas", path: "/alertas", icon: "alert" },
  { label: "Conversar", path: "/assistente", icon: "hydroBot" },
] as const;

const moreRoutes = [
  { label: "Configurações", path: "/configuracoes", icon: "settings" },
  { label: "Sobre", path: "/sobre", icon: "info" },
] as const;

export function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [intervalOpen, setIntervalOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { width, height } = useWindowDimensions();
  const pathname = usePathname();
  const router = useRouter();
  const { intervalSeconds, remainingSeconds, setIntervalSeconds } = useRefreshInterval();
  const isLandscape = width > height;
  const compactHeader = width < 390;

  function navigate(path: string) {
    setMenuOpen(false);
    router.push(path as never);
  }

  return (
    <>
      <View style={[styles.header, isLandscape && styles.headerLandscape]}>
        <Pressable style={styles.brandArea} onPress={() => navigate("/")} accessibilityRole="button">
          <View style={styles.brandIcon}>
            <AppIcon name="drop" color={Colors.blueLight} size={28} />
          </View>
          <View style={styles.brandTextArea}>
            <Text style={styles.brand}>HidroAlerta</Text>
            <Text style={styles.tagline}>Sensores inteligentes e Inteligência Artificial</Text>
          </View>
        </Pressable>

        <View style={styles.actions}>
          <Pressable
            style={styles.intervalButton}
            onPress={() => setIntervalOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`Intervalo de atualização: ${intervalSeconds} segundos`}
          >
            <View>
              <Text style={styles.intervalLabel}>Intervalo</Text>
              <Text style={styles.intervalText}>{intervalSeconds}s</Text>
            </View>
            <AppIcon name="chevron" color={Colors.bluePale} size={16} />
          </Pressable>
          <View style={styles.countdownBox} accessibilityLabel={`${remainingSeconds} segundos para atualizar`}>
            <Text style={styles.countdownLabel}>Próxima em</Text>
            <Text style={styles.countdownValue}>{remainingSeconds}s</Text>
          </View>
          <Pressable
            style={styles.iconButton}
            onPress={() => navigate("/alertas")}
            accessibilityRole="button"
            accessibilityLabel="Abrir alertas"
          >
            <AppIcon name="notification" color={Colors.white} size={22} />
            <View style={styles.notificationDot} />
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={() => setMenuOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Abrir menu"
          >
            <AppIcon name="menu" color={Colors.white} size={26} />
          </Pressable>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={menuOpen}
        statusBarTranslucent
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuOpen(false)} />
          <SafeAreaView style={styles.menuSafeArea} pointerEvents="box-none">
            <View
              style={[
                styles.menu,
                isLandscape && styles.menuLandscape,
                {
                  width: Math.min(320, width - 32),
                  maxHeight: Math.max(240, height - (isLandscape ? 78 : 104)),
                },
              ]}
            >
              <View style={styles.menuHeading}>
                <Text style={styles.menuTitle}>Navegação</Text>
                <Pressable
                  style={styles.closeButton}
                  onPress={() => setMenuOpen(false)}
                  accessibilityLabel="Fechar menu"
                >
                  <Text style={styles.closeText}>×</Text>
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {mainRoutes.map((item) => {
                  const active = pathname === item.path;
                  return (
                    <Pressable
                      key={item.path}
                      style={[styles.menuItem, active && styles.menuItemActive]}
                      onPress={() => navigate(item.path)}
                    >
                      <AppIcon
                        name={item.icon}
                        color={active ? Colors.navy : Colors.bluePale}
                        size={22}
                      />
                      <Text style={[styles.menuItemText, active && styles.menuItemTextActive]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}

                <View style={styles.divider} />
                <Pressable style={styles.menuItem} onPress={() => setMoreOpen((value) => !value)}>
                  <AppIcon name="more" color={Colors.bluePale} size={22} />
                  <Text style={styles.menuItemText}>Mais</Text>
                  <View style={[styles.chevron, moreOpen && styles.chevronOpen]}>
                    <AppIcon name="chevron" color={Colors.muted} size={20} />
                  </View>
                </Pressable>

                {moreOpen && (
                  <View style={styles.moreItems}>
                    {moreRoutes.map((item) => (
                      <Pressable
                        key={item.path}
                        style={styles.menuItem}
                        onPress={() => navigate(item.path)}
                      >
                        <AppIcon name={item.icon} color={Colors.muted} size={20} />
                        <Text style={styles.moreItemText}>{item.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={intervalOpen}
        statusBarTranslucent
        onRequestClose={() => setIntervalOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIntervalOpen(false)} />
          <SafeAreaView style={styles.intervalSafeArea} pointerEvents="box-none">
            <View
              style={[
                styles.intervalMenu,
                isLandscape && styles.intervalMenuLandscape,
                compactHeader && styles.intervalMenuCompact,
              ]}
            >
              <Text style={styles.intervalMenuTitle}>Atualizar a cada</Text>
              {refreshOptions.map((seconds) => {
                const selected = seconds === intervalSeconds;
                return (
                  <Pressable
                    key={seconds}
                    style={[styles.intervalOption, selected && styles.intervalOptionSelected]}
                    onPress={() => {
                      setIntervalSeconds(seconds);
                      setIntervalOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.intervalOptionText,
                        selected && styles.intervalOptionTextSelected,
                      ]}
                    >
                      {seconds} segundos
                    </Text>
                    {selected && <View style={styles.selectedDot} />}
                  </Pressable>
                );
              })}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 124,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: "rgba(6, 26, 47, 0.94)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(77, 182, 232, 0.2)",
  },
  headerLandscape: {
    minHeight: 112,
    paddingHorizontal: 28,
    paddingVertical: 8,
  },
  brand: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  brandArea: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  brandIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "rgba(77, 182, 232, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.2)",
  },
  brandTextArea: {
    flexShrink: 1,
  },
  tagline: {
    marginTop: 2,
    color: Colors.muted,
    fontSize: 11,
  },
  actions: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  intervalButton: {
    flex: 1,
    minWidth: 74,
    height: 44,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 14,
    backgroundColor: Colors.navySoft,
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.24)",
  },
  intervalText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  intervalLabel: {
    color: Colors.muted,
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  countdownBox: {
    flex: 1.25,
    minWidth: 88,
    height: 44,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    borderRadius: 14,
    backgroundColor: "rgba(77, 182, 232, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.28)",
  },
  countdownLabel: {
    color: Colors.muted,
    fontSize: 10,
    fontWeight: "600",
  },
  countdownValue: {
    color: Colors.blueLight,
    fontSize: 18,
    fontWeight: "900",
  },
  iconButton: {
    width: 40,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: Colors.navySoft,
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.24)",
  },
  notificationDot: {
    position: "absolute",
    right: 9,
    top: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.blueLight,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  menuSafeArea: {
    flex: 1,
    alignItems: "flex-end",
  },
  intervalSafeArea: {
    flex: 1,
    alignItems: "flex-start",
  },
  menu: {
    marginTop: 124,
    marginRight: 16,
    padding: 12,
    borderRadius: 22,
    backgroundColor: Colors.navySoft,
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.35)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  menuLandscape: {
    marginTop: 112,
    marginRight: 28,
  },
  menuHeading: {
    minHeight: 48,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: Colors.muted,
    fontSize: 30,
    fontWeight: "300",
    lineHeight: 32,
  },
  menuItem: {
    minHeight: 50,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
  },
  menuItemActive: {
    backgroundColor: Colors.blueLight,
  },
  menuItemText: {
    flex: 1,
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  menuItemTextActive: {
    color: Colors.navy,
  },
  divider: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 8,
    backgroundColor: "rgba(156, 199, 223, 0.18)",
  },
  chevron: {
    transform: [{ rotate: "0deg" }],
  },
  chevronOpen: {
    transform: [{ rotate: "180deg" }],
  },
  moreItems: {
    marginLeft: 18,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(77, 182, 232, 0.3)",
  },
  moreItemText: {
    color: Colors.bluePale,
    fontSize: 15,
    fontWeight: "500",
  },
  intervalMenu: {
    width: 190,
    marginTop: 124,
    marginLeft: 16,
    padding: 10,
    borderRadius: 18,
    backgroundColor: Colors.navySoft,
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.35)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  intervalMenuLandscape: {
    marginTop: 112,
    marginLeft: 28,
  },
  intervalMenuCompact: {
    marginLeft: 16,
  },
  intervalMenuTitle: {
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: Colors.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  intervalOption: {
    minHeight: 43,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
  },
  intervalOptionSelected: {
    backgroundColor: Colors.blueLight,
  },
  intervalOptionText: {
    color: Colors.bluePale,
    fontSize: 14,
    fontWeight: "600",
  },
  intervalOptionTextSelected: {
    color: Colors.navy,
    fontWeight: "800",
  },
  selectedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.navy,
  },
});
