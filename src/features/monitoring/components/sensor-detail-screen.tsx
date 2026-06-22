import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { AppIcon } from "@/shared/components/app-icon";
import { Colors } from "@/shared/constants/colors";
import { useCountUp } from "@/shared/hooks/use-count-up";
import { AskAssistantButton } from "@/features/assistant/components/ask-assistant-button";

type SensorIcon = "drop" | "turbidity" | "temperature";

type SensorDetailScreenProps = {
  title: string;
  label: string;
  value: number;
  decimals: number;
  unit?: string;
  icon: SensorIcon;
  accent: string;
  progress: number;
  status: string;
  description: string;
  recommendedRange: string;
  rangeStart: number;
  rangeWidth: number;
  markerPosition: number;
  primaryLabel: string;
  primaryValue: string;
  secondaryLabel: string;
  secondaryValue: string;
  insightTitle: string;
  insight: string;
  labelFontSize?: number;
};

export function SensorDetailScreen({
  title,
  label,
  value,
  decimals,
  unit,
  icon,
  accent,
  progress,
  status,
  description,
  recommendedRange,
  rangeStart,
  rangeWidth,
  markerPosition,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
  insightTitle,
  insight,
  labelFontSize = 12,
}: SensorDetailScreenProps) {
  const router = useRouter();
  const animatedValue = useCountUp(value, decimals, 160, 1050);
  const statusPulse = useSharedValue(1);
  const progressValue = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }));
  const pulseStyle = useAnimatedStyle(() => ({ opacity: statusPulse.value }));
  const circumference = 2 * Math.PI * 92;
  const dashOffset = circumference * (1 - progress / 100);

  useEffect(() => {
    progressValue.value = withTiming(progress, {
      duration: 1050,
      easing: Easing.out(Easing.cubic),
    });
    // Reanimated shared values are intentionally mutable animation handles.
    // eslint-disable-next-line react-hooks/immutability
    statusPulse.value = withRepeat(
      withTiming(0.4, { duration: 760, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    return () => cancelAnimation(statusPulse);
  }, [progress, progressValue, statusPulse]);

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.headerButton, pressed && styles.buttonPressed]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <Animated.View entering={FadeInDown.duration(450)} style={styles.heroCard}>
          <View style={[styles.heroGlow, { backgroundColor: accent }]} />
          <View style={styles.gauge}>
            <Svg width={220} height={220} viewBox="0 0 220 220">
              <Circle
                cx="110"
                cy="110"
                r="92"
                fill="transparent"
                stroke="rgba(156, 199, 223, 0.12)"
                strokeWidth="12"
              />
              <Circle
                cx="110"
                cy="110"
                r="92"
                fill="transparent"
                stroke={accent}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 110 110)"
              />
            </Svg>
            <View style={styles.gaugeContent}>
              <AppIcon name={icon} color={accent} size={38} />
              <Text
                style={styles.heroValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.72}
              >
                {animatedValue}
                {unit ? <Text style={styles.heroUnit}> {unit}</Text> : null}
              </Text>
              <Text
                style={[styles.heroLabel, { fontSize: labelFontSize }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {label}
              </Text>
            </View>
          </View>
          <View style={styles.liveBadge}>
            <Animated.View style={[styles.liveDot, { backgroundColor: accent }, pulseStyle]} />
            <Text style={styles.liveText}>Leitura em tempo real</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(420)} style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{primaryLabel}</Text>
            <Text style={styles.detailValue}>{primaryValue}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{secondaryLabel}</Text>
            <Text style={styles.detailValue}>{secondaryValue}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(420)} style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={styles.statusValueArea}>
              <Text style={[styles.statusValue, { color: accent }]}>{status}</Text>
              <Animated.View style={[styles.statusDot, { backgroundColor: accent }, pulseStyle]} />
            </View>
          </View>
          <Text style={styles.statusDescription}>{description}</Text>

          <View style={styles.rangeSection}>
            <View style={styles.recommendedRow}>
              <Text style={styles.recommendedLabel}>Faixa recomendada</Text>
              <Text style={styles.recommendedValue}>{recommendedRange}</Text>
            </View>
            <View style={styles.rangeTrack}>
              <View
                style={[
                  styles.recommendedRange,
                  {
                    left: `${rangeStart}%`,
                    width: `${rangeWidth}%`,
                    backgroundColor: `${accent}66`,
                  },
                ]}
              />
              <View style={[styles.currentMarker, { left: `${markerPosition}%` }]} />
            </View>
            <Animated.View style={[styles.progressFill, { backgroundColor: accent }, progressStyle]} />
          </View>

          <View style={styles.insightCard}>
            <View style={[styles.insightIcon, { backgroundColor: `${accent}22` }]}>
              <AppIcon name="info" color={accent} size={20} />
            </View>
            <View style={styles.insightTextArea}>
              <Text style={styles.insightTitle}>{insightTitle}</Text>
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          </View>
        </Animated.View>

        <AskAssistantButton
          label="Analisar esta leitura"
          prompt={`Analise a leitura de ${title}: valor atual ${value}${unit ? ` ${unit}` : ""}, status ${status} e faixa recomendada ${recommendedRange}. Explique o que isso significa e se devo tomar alguma ação.`}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, padding: 16, backgroundColor: Colors.navy },
  content: { flex: 1, width: "100%", maxWidth: 720, alignSelf: "center", gap: 14 },
  header: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: Colors.navySoft },
  buttonPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  backIcon: { marginTop: -4, color: Colors.white, fontSize: 38, fontWeight: "300" },
  title: { flex: 1, color: Colors.white, fontSize: 22, fontWeight: "900", textAlign: "center" },
  headerPlaceholder: { width: 44 },
  heroCard: { minHeight: 300, alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 24, backgroundColor: "#071F36", borderWidth: 1, borderColor: "rgba(77, 182, 232, 0.16)" },
  heroGlow: { position: "absolute", top: -130, width: 280, height: 280, borderRadius: 140, opacity: 0.1 },
  gauge: { width: 220, height: 220, alignItems: "center", justifyContent: "center" },
  gaugeContent: { position: "absolute", width: 176, alignItems: "center", justifyContent: "center" },
  heroValue: { width: "100%", marginTop: 3, color: Colors.white, fontSize: 40, lineHeight: 45, fontWeight: "900", textAlign: "center" },
  heroUnit: { fontSize: 16, fontWeight: "700" },
  heroLabel: { width: "100%", marginTop: 5, color: Colors.muted, fontSize: 12, fontWeight: "800", textAlign: "center", textTransform: "uppercase" },
  liveBadge: { marginTop: 8, paddingHorizontal: 12, minHeight: 30, flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 15, backgroundColor: "rgba(77, 182, 232, 0.08)" },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveText: { color: Colors.bluePale, fontSize: 12, fontWeight: "700" },
  detailsCard: { paddingHorizontal: 16, borderRadius: 18, backgroundColor: Colors.navySoft, borderWidth: 1, borderColor: "rgba(77, 182, 232, 0.16)" },
  detailRow: { minHeight: 57, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  detailLabel: { color: Colors.bluePale, fontSize: 16, fontWeight: "600" },
  detailValue: { color: Colors.white, fontSize: 18, fontWeight: "900" },
  detailDivider: { height: 1, backgroundColor: "rgba(156, 199, 223, 0.16)" },
  statusCard: { flex: 1, minHeight: 270, padding: 16, borderRadius: 18, backgroundColor: Colors.navySoft, borderWidth: 1, borderColor: "rgba(77, 182, 232, 0.16)" },
  statusHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statusLabel: { color: Colors.white, fontSize: 17, fontWeight: "700" },
  statusValueArea: { flexDirection: "row", alignItems: "center", gap: 7 },
  statusValue: { fontSize: 18, fontWeight: "900" },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusDescription: { marginTop: 10, color: Colors.bluePale, fontSize: 15 },
  rangeSection: { marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(156, 199, 223, 0.14)" },
  recommendedRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  recommendedLabel: { color: Colors.muted, fontSize: 14, fontWeight: "700" },
  recommendedValue: { color: Colors.bluePale, fontSize: 16, fontWeight: "900" },
  rangeTrack: { position: "relative", height: 12, marginTop: 14, overflow: "visible", borderRadius: 6, backgroundColor: "#061A2F" },
  recommendedRange: { position: "absolute", height: "100%", borderRadius: 6 },
  currentMarker: { position: "absolute", top: -4, width: 5, height: 20, marginLeft: -2, borderRadius: 3, backgroundColor: Colors.white },
  progressFill: { height: 3, marginTop: 12, borderRadius: 2, opacity: 0.65 },
  insightCard: { marginTop: 18, padding: 12, flexDirection: "row", alignItems: "center", gap: 11, borderRadius: 14, backgroundColor: "rgba(77, 182, 232, 0.07)" },
  insightIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  insightTextArea: { flex: 1 },
  insightTitle: { color: Colors.white, fontSize: 14, fontWeight: "900" },
  insightText: { marginTop: 3, color: Colors.muted, fontSize: 12, lineHeight: 17 },
});
