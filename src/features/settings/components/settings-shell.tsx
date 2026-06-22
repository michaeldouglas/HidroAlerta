import type { PropsWithChildren } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Colors } from "@/shared/constants/colors";

type SettingsShellProps = PropsWithChildren<{
  title: string;
  description?: string;
}>;

export function SettingsShell({ title, description, children }: SettingsShellProps) {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.placeholder} />
        </View>
        {description ? <Text style={styles.description}>{description}</Text> : null}
        <Animated.View entering={FadeInDown.duration(420)} style={styles.body}>
          {children}
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, padding: 16, backgroundColor: Colors.navy },
  content: { flex: 1, width: "100%", maxWidth: 720, alignSelf: "center" },
  header: { minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: Colors.navySoft },
  pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  backIcon: { marginTop: -4, color: Colors.white, fontSize: 38, fontWeight: "300" },
  title: { flex: 1, color: Colors.white, fontSize: 21, fontWeight: "900", textAlign: "center" },
  placeholder: { width: 44 },
  description: { marginTop: 10, color: Colors.muted, fontSize: 14, lineHeight: 20, textAlign: "center" },
  body: { flex: 1, marginTop: 18 },
});
