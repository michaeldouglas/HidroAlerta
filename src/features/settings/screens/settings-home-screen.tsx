import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SettingsShell } from "@/features/settings/components/settings-shell";
import { AppIcon } from "@/shared/components/app-icon";
import { Colors } from "@/shared/constants/colors";

const mainItems = [
  { label: "Unidade de medida", path: "/configuracoes/unidades", icon: "ruler" },
  { label: "Notificações", path: "/configuracoes/notificacoes", icon: "notification" },
  { label: "Usuários", path: "/configuracoes/usuarios", icon: "users" },
  { label: "Rede e dispositivos", path: "/configuracoes/rede", icon: "wifi" },
  { label: "Backup e dados", path: "/configuracoes/backup", icon: "backup" },
] as const;

export default function SettingsHomeScreen() {
  const router = useRouter();

  return (
    <SettingsShell title="Configurações">
      <View style={styles.group}>
        {mainItems.map((item, index) => (
          <Pressable
            key={item.path}
            style={({ pressed }) => [
              styles.item,
              index < mainItems.length - 1 && styles.itemBorder,
              pressed && styles.itemPressed,
            ]}
            onPress={() => router.push(item.path)}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${item.label}`}
          >
            <View style={styles.iconBox}>
              <AppIcon name={item.icon} color={Colors.white} size={22} />
            </View>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <AppIcon name="chevronRight" color={Colors.bluePale} size={20} />
          </Pressable>
        ))}
      </View>

      <View style={[styles.group, styles.aboutGroup]}>
        <Pressable
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          onPress={() => router.push("/sobre")}
          accessibilityRole="button"
          accessibilityLabel="Sobre o HidroAlerta"
        >
          <View style={styles.iconBox}>
            <AppIcon name="info" color={Colors.white} size={22} />
          </View>
          <View style={styles.aboutText}>
            <Text style={styles.aboutLabel}>Sobre o HidroAlerta</Text>
            <Text style={styles.version}>Sensores inteligentes + IA • Versão 1.0.0</Text>
          </View>
          <AppIcon name="chevronRight" color={Colors.bluePale} size={20} />
        </Pressable>
      </View>
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  group: { overflow: "hidden", borderRadius: 18, backgroundColor: Colors.navySoft, borderWidth: 1, borderColor: "rgba(77, 182, 232, 0.12)" },
  aboutGroup: { marginTop: 14 },
  item: { minHeight: 64, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(156, 199, 223, 0.12)" },
  itemPressed: { backgroundColor: "rgba(77, 182, 232, 0.12)" },
  iconBox: { width: 32, alignItems: "center" },
  itemLabel: { flex: 1, color: Colors.white, fontSize: 15, fontWeight: "600" },
  aboutText: { flex: 1, minHeight: 42, justifyContent: "center" },
  aboutLabel: { color: Colors.white, fontSize: 15, fontWeight: "600" },
  version: { marginTop: 3, color: Colors.muted, fontSize: 11 },
});
