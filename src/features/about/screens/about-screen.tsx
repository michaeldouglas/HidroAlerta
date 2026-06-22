import { StyleSheet, Text, View } from "react-native";

import { SettingsShell } from "@/features/settings/components/settings-shell";
import { AppIcon } from "@/shared/components/app-icon";
import { Colors } from "@/shared/constants/colors";

export default function AboutScreen() {
  return (
    <SettingsShell title="Sobre o HidroAlerta">
      <View style={styles.hero}>
        <View style={styles.logo}>
          <AppIcon name="drop" color={Colors.white} size={44} />
        </View>
        <Text style={styles.name}>HidroAlerta</Text>
        <Text style={styles.tagline}>Monitoramento Inteligente da Qualidade da Água</Text>
        <Text style={styles.version}>Versão 1.0.0</Text>
        <Text style={styles.description}>
          Plataforma que combina sensores inteligentes, computação em nuvem e Inteligência Artificial para monitorar, analisar e visualizar as condições da água em tempo real.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.infoRow}>
          <AppIcon name="sensors" color={Colors.blueLight} size={23} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Monitoramento contínuo</Text>
            <Text style={styles.infoDescription}>Nível, pH, turbidez e temperatura coletados diretamente dos reservatórios.</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <AppIcon name="database" color={Colors.blueLight} size={23} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Dados na nuvem</Text>
            <Text style={styles.infoDescription}>Leituras organizadas em um painel acessível pelo celular ou navegador.</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <AppIcon name="info" color={Colors.blueLight} size={23} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Inteligência Artificial</Text>
            <Text style={styles.infoDescription}>Interpreta tendências, apoia análises preditivas e apresenta explicações e recomendações claras.</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <AppIcon name="notification" color={Colors.blueLight} size={23} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Prevenção por alertas</Text>
            <Text style={styles.infoDescription}>Avisa quando uma leitura sai dos limites configurados para permitir uma ação preventiva.</Text>
          </View>
        </View>
      </View>

      <Text style={styles.footer}>© 2026 HidroAlerta</Text>
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 24, alignItems: "center", borderRadius: 22, backgroundColor: Colors.navySoft, borderWidth: 1, borderColor: "rgba(77, 182, 232, 0.16)" },
  logo: { width: 82, height: 82, alignItems: "center", justifyContent: "center", borderRadius: 25, backgroundColor: Colors.blue },
  name: { marginTop: 14, color: Colors.white, fontSize: 27, fontWeight: "900" },
  tagline: { maxWidth: 420, marginTop: 4, color: Colors.bluePale, fontSize: 13, lineHeight: 18, fontWeight: "800", textAlign: "center" },
  version: { marginTop: 5, color: Colors.blueLight, fontSize: 11, fontWeight: "800" },
  description: { maxWidth: 480, marginTop: 15, color: Colors.muted, fontSize: 13, lineHeight: 20, textAlign: "center" },
  card: { marginTop: 14, paddingHorizontal: 15, borderRadius: 18, backgroundColor: Colors.navySoft, borderWidth: 1, borderColor: "rgba(77, 182, 232, 0.14)" },
  infoRow: { minHeight: 84, flexDirection: "row", alignItems: "center", gap: 13 },
  infoText: { flex: 1 },
  infoTitle: { color: Colors.white, fontSize: 15, fontWeight: "800" },
  infoDescription: { marginTop: 4, color: Colors.muted, fontSize: 12, lineHeight: 17 },
  divider: { height: 1, backgroundColor: "rgba(156, 199, 223, 0.12)" },
  footer: { marginTop: 18, color: Colors.muted, fontSize: 11, textAlign: "center" },
});
