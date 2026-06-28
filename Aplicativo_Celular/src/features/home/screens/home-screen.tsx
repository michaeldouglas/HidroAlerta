import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { AppIcon } from "@/shared/components/app-icon";
import { Colors } from "@/shared/constants/colors";
import { useRefreshInterval } from "@/shared/contexts/refresh-interval-context";
import { useTankDetailAccess } from "@/shared/contexts/tank-detail-access-context";
import { useCountUp } from "@/shared/hooks/use-count-up";
import { AskAssistantButton } from "@/features/assistant/components/ask-assistant-button";

function formatUpdatedAt(date: Date) {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${value("day")}/${value("month")}/${value("year")}`,
    time: `${value("hour")}:${value("minute")}:${value("second")}`,
  };
}

type MetricCardProps = {
  label: string;
  target: number;
  decimals?: number;
  suffix?: string;
  unit?: string;
  status: string;
  icon: "waves" | "drop" | "turbidity" | "temperature";
  iconColor: string;
  delay: number;
  onPress?: () => void;
};

function MetricCard({
  label,
  target,
  decimals = 0,
  suffix,
  unit,
  status,
  icon,
  iconColor,
  delay,
  onPress,
}: MetricCardProps) {
  const animatedValue = useCountUp(target, decimals, delay + 120);

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(420)}
      style={styles.metricCardAnimation}
    >
      <Pressable
        style={({ pressed }) => [
          styles.metricCard,
          { borderColor: `${iconColor}38` },
          pressed && onPress && styles.metricCardPressed,
        ]}
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? "button" : undefined}
      >
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricBody}>
        <View
          style={[
            styles.metricIcon,
            { backgroundColor: `${iconColor}14`, borderColor: `${iconColor}2E` },
          ]}
        >
          <AppIcon name={icon} color={iconColor} size={44} />
        </View>
        <View style={styles.metricValueArea}>
          <Text style={styles.metricValue}>
            {animatedValue}{suffix}
            {unit ? <Text style={styles.metricUnit}> {unit}</Text> : null}
          </Text>
          <Text style={styles.metricStatus}>{status}</Text>
        </View>
      </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [qualityInfoOpen, setQualityInfoOpen] = useState(false);
  const { width, height } = useWindowDimensions();
  const { lastUpdatedAt } = useRefreshInterval();
  const { grantAccess } = useTankDetailAccess();
  const router = useRouter();
  const isLandscape = width > height;
  const updatedAt = formatUpdatedAt(lastUpdatedAt);
  const animatedScore = useCountUp(92, 0, 120);
  const scoreProgress = useSharedValue(0);
  const waveOffset = useSharedValue(0);
  const scoreProgressStyle = useAnimatedStyle(() => ({
    width: `${scoreProgress.value}%`,
  }));
  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: waveOffset.value }],
  }));
  const reverseWaveStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -waveOffset.value * 0.7 }],
  }));

  useEffect(() => {
    scoreProgress.value = withDelay(
      120,
      withTiming(92, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [scoreProgress]);

  useEffect(() => {
    // Reanimated shared values are intentionally mutable animation handles.
    // eslint-disable-next-line react-hooks/immutability
    waveOffset.value = withRepeat(
      withTiming(55, { duration: 4200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    return () => cancelAnimation(waveOffset);
  }, [waveOffset]);

  return (
    <>
    <ScrollView
      contentContainerStyle={[styles.page, isLandscape && styles.pageLandscape]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.dashboard, isLandscape && styles.dashboardLandscape]}>
        <Animated.View
          entering={FadeInDown.duration(480)}
          style={[styles.qualityCardAnimation, isLandscape && styles.qualityCardAnimationLandscape]}
        >
          <Pressable
            style={({ pressed }) => [styles.qualityCard, pressed && styles.qualityCardPressed]}
            onPress={() => setQualityInfoOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Entender os critérios de qualidade da água"
          >
          <View style={styles.waveViewport} pointerEvents="none">
            <Animated.View style={[styles.waveLayer, styles.waveLayerBack, reverseWaveStyle]}>
              <Svg width="100%" height="100%" viewBox="0 0 600 150" preserveAspectRatio="none">
                <Path
                  d="M0 58 C70 18 135 92 210 52 C285 12 350 86 425 48 C500 12 550 64 600 42 L600 150 L0 150 Z"
                  fill="rgba(77, 182, 232, 0.07)"
                />
              </Svg>
            </Animated.View>
            <Animated.View style={[styles.waveLayer, styles.waveLayerFront, waveStyle]}>
              <Svg width="100%" height="100%" viewBox="0 0 600 150" preserveAspectRatio="none">
                <Path
                  d="M0 72 C65 35 120 105 195 68 C270 30 340 100 415 65 C490 30 550 82 600 58 L600 150 L0 150 Z"
                  fill="rgba(91, 231, 139, 0.09)"
                />
              </Svg>
            </Animated.View>
          </View>

          <View style={styles.qualityInfo}>
            <Text style={styles.qualityLabel}>QUALIDADE DA ÁGUA</Text>
            <Text style={styles.qualityValue}>BOA</Text>
            <Text style={styles.scoreLabel}>Qualidade da água</Text>
            <Text style={styles.scoreValue}>{animatedScore}%</Text>
          </View>

          <View style={styles.dropCircle}>
            <AppIcon name="drop" color={Colors.white} size={48} />
          </View>

          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, scoreProgressStyle]} />
          </View>
          <Text style={styles.criteriaHint}>Toque para entender os critérios</Text>
          </Pressable>
        </Animated.View>

        <View style={[styles.metricsSection, isLandscape && styles.metricsSectionLandscape]}>
          <View style={styles.metricsGrid}>
            <View style={styles.metricRow}>
              <MetricCard
                label="NÍVEL DA CAIXA"
                target={82}
                suffix="%"
                status="Bom"
                icon="waves"
                iconColor="#27B6FF"
                delay={80}
                onPress={() => {
                  grantAccess();
                  router.push("/nivel-caixa");
                }}
              />
              <MetricCard
                label="pH"
                target={7.1}
                decimals={1}
                status="Ideal"
                icon="drop"
                iconColor="#2D9CFF"
                delay={140}
                onPress={() => router.push("/ph")}
              />
            </View>
            <View style={styles.metricRow}>
              <MetricCard
                label="TURBIDEZ"
                target={1.3}
                decimals={1}
                unit="NTU"
                status="Boa"
                icon="turbidity"
                iconColor="#30A9FF"
                delay={200}
                onPress={() => router.push("/turbidez")}
              />
              <MetricCard
                label="TEMPERATURA"
                target={24.1}
                decimals={1}
                unit="°C"
                status="Ideal"
                icon="temperature"
                iconColor="#36D6CC"
                delay={260}
                onPress={() => router.push("/temperatura")}
              />
            </View>
          </View>

          <View style={styles.updatedSection}>
            <Text style={styles.updatedLabel}>Última atualização</Text>
            <View style={styles.updatedInfo}>
              <View style={styles.updatedItem}>
                <AppIcon name="calendar" color={Colors.blueLight} size={20} />
                <Text style={styles.updatedValue}>{updatedAt.date}</Text>
              </View>
              <View style={styles.updatedItem}>
                <AppIcon name="clock" color={Colors.blueLight} size={20} />
                <Text style={styles.updatedValue}>{updatedAt.time}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={qualityInfoOpen}
        onRequestClose={() => setQualityInfoOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setQualityInfoOpen(false)} />
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.qualityModal}>
              <View style={styles.modalHeading}>
                <View style={styles.modalHeadingIcon}>
                  <AppIcon name="drop" color={Colors.blueLight} size={28} />
                </View>
                <View style={styles.modalHeadingText}>
                  <Text style={styles.modalTitle}>Qualidade da água</Text>
                  <Text style={styles.modalSubtitle}>Como interpretamos o percentual</Text>
                </View>
              </View>

              <View style={styles.trafficLight}>
                <View style={styles.trafficItem}>
                  <View style={[styles.trafficDot, styles.trafficGreen]} />
                  <View style={styles.trafficTextArea}>
                    <Text style={styles.trafficTitle}>Verde • Boa</Text>
                    <Text style={styles.trafficDescription}>Indicadores dentro dos limites configurados.</Text>
                  </View>
                </View>
                <View style={styles.trafficItem}>
                  <View style={[styles.trafficDot, styles.trafficYellow]} />
                  <View style={styles.trafficTextArea}>
                    <Text style={styles.trafficTitle}>Amarelo • Atenção</Text>
                    <Text style={styles.trafficDescription}>Algum indicador está próximo ou fora da faixa esperada.</Text>
                  </View>
                </View>
                <View style={styles.trafficItem}>
                  <View style={[styles.trafficDot, styles.trafficRed]} />
                  <View style={styles.trafficTextArea}>
                    <Text style={styles.trafficTitle}>Vermelho • Crítica</Text>
                    <Text style={styles.trafficDescription}>Há valor crítico e é necessária uma verificação imediata.</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.measuredTitle}>O que medimos</Text>
              <View style={styles.measuredGrid}>
                <View style={styles.measuredItem}>
                  <AppIcon name="drop" color="#3BA8FF" size={25} />
                  <Text style={styles.measuredItemTitle}>pH</Text>
                  <Text style={styles.measuredDescription}>Acidez ou alcalinidade.</Text>
                </View>
                <View style={styles.measuredItem}>
                  <AppIcon name="turbidity" color="#62D878" size={25} />
                  <Text style={styles.measuredItemTitle}>Turbidez</Text>
                  <Text style={styles.measuredDescription}>Partículas suspensas.</Text>
                </View>
                <View style={styles.measuredItem}>
                  <AppIcon name="temperature" color="#45D7C7" size={25} />
                  <Text style={styles.measuredItemTitle}>Temperatura</Text>
                  <Text style={styles.measuredDescription}>Condição térmica da água.</Text>
                </View>
              </View>

              <View style={styles.modalNote}>
                <AppIcon name="info" color={Colors.blueLight} size={20} />
                <Text style={styles.modalNoteText}>
                  O nível da caixa indica quantidade disponível e não entra no cálculo de qualidade.
                </Text>
              </View>

              <AskAssistantButton
                label="Perguntar por que a qualidade está boa"
                prompt="Explique por que a qualidade da água está boa considerando pH 7,1, turbidez 1,3 NTU, temperatura 24,1 °C e nível da caixa em 82%."
                onBeforeNavigate={() => setQualityInfoOpen(false)}
              />

              <Pressable style={styles.modalCloseButton} onPress={() => setQualityInfoOpen(false)}>
                <Text style={styles.modalCloseText}>Entendi</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "transparent",
  },
  pageLandscape: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    justifyContent: "center",
  },
  dashboard: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    gap: 12,
  },
  dashboardLandscape: {
    maxWidth: 980,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 14,
  },
  qualityCard: {
    flex: 1,
    minHeight: 190,
    padding: 22,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#096536",
    borderWidth: 1,
    borderColor: "rgba(72, 224, 127, 0.25)",
    shadowColor: "#032316",
    shadowOpacity: 0.38,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 9,
  },
  qualityCardAnimation: {
    minHeight: 190,
  },
  qualityCardAnimationLandscape: {
    flex: 0.8,
    minHeight: 230,
  },
  qualityCardPressed: {
    transform: [{ scale: 0.99 }],
    borderColor: "rgba(126, 238, 160, 0.65)",
  },
  waveViewport: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
  },
  waveLayer: {
    position: "absolute",
    left: -90,
    width: "150%",
    height: 155,
  },
  waveLayerBack: {
    bottom: 8,
  },
  waveLayerFront: {
    bottom: -18,
  },
  qualityInfo: {
    zIndex: 1,
  },
  qualityLabel: {
    color: "#D8FFE5",
    fontSize: 14,
    fontWeight: "800",
  },
  qualityValue: {
    marginTop: 4,
    color: Colors.white,
    fontSize: 34,
    fontWeight: "900",
  },
  scoreLabel: {
    marginTop: 12,
    color: "#8BE8AA",
    fontSize: 15,
  },
  scoreValue: {
    marginTop: 2,
    color: Colors.white,
    fontSize: 28,
    fontWeight: "800",
  },
  dropCircle: {
    position: "absolute",
    top: 25,
    right: 22,
    width: 92,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 46,
    backgroundColor: "rgba(73, 210, 117, 0.48)",
  },
  progressTrack: {
    position: "absolute",
    left: 22,
    right: 22,
    bottom: 18,
    height: 10,
    overflow: "hidden",
    borderRadius: 5,
    backgroundColor: "rgba(0, 50, 25, 0.55)",
  },
  progressFill: {
    width: "0%",
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#4BD47B",
  },
  criteriaHint: {
    position: "absolute",
    right: 22,
    bottom: 34,
    color: "rgba(216, 255, 229, 0.72)",
    fontSize: 10,
    fontWeight: "700",
  },
  metricsSection: {
    flex: 1,
    gap: 12,
  },
  metricsSectionLandscape: {
    flex: 1.2,
    justifyContent: "center",
  },
  metricsGrid: {
    flex: 1,
    gap: 10,
  },
  metricRow: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    width: "100%",
    minHeight: 165,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#0A315A",
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  metricCardAnimation: {
    flex: 1,
  },
  metricCardPressed: {
    transform: [{ scale: 0.98 }],
    borderColor: Colors.blueLight,
  },
  metricLabel: {
    color: Colors.blueLight,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  metricBody: {
    flex: 1,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  metricIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    borderWidth: 1,
  },
  metricValueArea: {
    alignItems: "center",
    justifyContent: "center",
  },
  metricValue: {
    color: Colors.white,
    fontSize: 36,
    lineHeight: 41,
    fontWeight: "900",
    textAlign: "center",
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: "700",
  },
  metricStatus: {
    marginTop: 5,
    color: "#62E77F",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  updatedSection: {
    alignItems: "center",
    gap: 7,
  },
  updatedLabel: {
    color: Colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  updatedInfo: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  updatedItem: {
    flex: 1,
    minHeight: 38,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: "rgba(77, 182, 232, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.2)",
  },
  updatedValue: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  modalRoot: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  modalScrollContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  qualityModal: {
    width: "100%",
    maxWidth: 520,
    padding: 20,
    gap: 18,
    borderRadius: 24,
    backgroundColor: Colors.navySoft,
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.35)",
  },
  modalHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalHeadingIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "rgba(77, 182, 232, 0.14)",
  },
  modalHeadingText: {
    flex: 1,
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "900",
  },
  modalSubtitle: {
    marginTop: 3,
    color: Colors.muted,
    fontSize: 13,
  },
  trafficLight: {
    gap: 9,
  },
  trafficItem: {
    minHeight: 68,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 15,
    backgroundColor: "rgba(6, 26, 47, 0.65)",
  },
  trafficDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  trafficGreen: {
    backgroundColor: "#62D878",
  },
  trafficYellow: {
    backgroundColor: "#FFD052",
  },
  trafficRed: {
    backgroundColor: "#FF6B6B",
  },
  trafficTextArea: {
    flex: 1,
  },
  trafficTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "900",
  },
  trafficDescription: {
    marginTop: 3,
    color: Colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  measuredTitle: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "900",
  },
  measuredGrid: {
    flexDirection: "row",
    gap: 8,
  },
  measuredItem: {
    flex: 1,
    minHeight: 115,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "rgba(77, 182, 232, 0.08)",
  },
  measuredItemTitle: {
    marginTop: 6,
    color: Colors.white,
    fontSize: 14,
    fontWeight: "900",
  },
  measuredDescription: {
    marginTop: 4,
    color: Colors.muted,
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
  },
  modalNote: {
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    borderRadius: 14,
    backgroundColor: "rgba(77, 182, 232, 0.1)",
  },
  modalNoteText: {
    flex: 1,
    color: Colors.bluePale,
    fontSize: 12,
    lineHeight: 18,
  },
  modalCloseButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: Colors.blueLight,
  },
  modalCloseText: {
    color: Colors.navy,
    fontSize: 15,
    fontWeight: "900",
  },
});
