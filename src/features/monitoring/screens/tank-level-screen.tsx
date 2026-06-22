import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

import { Colors } from "@/shared/constants/colors";
import { useTankDetailAccess } from "@/shared/contexts/tank-detail-access-context";
import { useCountUp } from "@/shared/hooks/use-count-up";
import { AskAssistantButton } from "@/features/assistant/components/ask-assistant-button";

const levelMarks = ["100%", "75%", "50%", "25%", "0%"];

export default function TankLevelScreen() {
  const router = useRouter();
  const { accessGranted, revokeAccess } = useTankDetailAccess();
  const waterLevel = useSharedValue(0);
  const statusPulse = useSharedValue(1);
  const animatedLevel = useCountUp(82, 0, 180, 1100);
  const animatedVolume = useCountUp(820, 0, 240, 1000);
  const animatedCapacity = useCountUp(1000, 0, 300, 1000);
  const animatedMargin = useCountUp(52, 0, 360, 900);
  const waterStyle = useAnimatedStyle(() => ({ height: `${waterLevel.value}%` }));
  const statusPulseStyle = useAnimatedStyle(() => ({ opacity: statusPulse.value }));

  useEffect(() => {
    if (!accessGranted) {
      router.replace("/");
      return;
    }

    waterLevel.value = withDelay(
      180,
      withTiming(82, { duration: 1100, easing: Easing.out(Easing.cubic) }),
    );

    return revokeAccess;
  }, [accessGranted, revokeAccess, router, waterLevel]);

  useEffect(() => {
    // Reanimated shared values are intentionally mutable animation handles.
    // eslint-disable-next-line react-hooks/immutability
    statusPulse.value = withRepeat(
      withTiming(0.35, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    return () => cancelAnimation(statusPulse);
  }, [statusPulse]);

  if (!accessGranted) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={() => router.back()} accessibilityLabel="Voltar">
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Nível da Caixa D’água</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <Animated.View entering={FadeInDown.duration(450)} style={styles.tankSection}>
          <View style={styles.scale}>
            {levelMarks.map((mark) => (
              <View key={mark} style={styles.scaleItem}>
                <Text style={styles.scaleText}>{mark}</Text>
                <View style={styles.scaleLine} />
              </View>
            ))}
          </View>

          <View style={styles.tankShadow} />
          <View style={styles.tankBody}>
            <Animated.View style={[styles.water, waterStyle]}>
              <View style={styles.waterSurface} />
            </Animated.View>
            <View style={styles.tankHighlight} />
          </View>
          <View style={styles.tankTop} />
          <View style={styles.tankLid} />
          <View style={styles.tankBase} />

          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{animatedLevel}%</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(420)} style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Volume estimado</Text>
            <Text style={styles.detailValue}>{animatedVolume} L</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Capacidade total</Text>
            <Text style={styles.detailValue}>{animatedCapacity} L</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(420)} style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabel}>Status</Text>
            <Animated.View style={[styles.statusValueArea, statusPulseStyle]}>
              <Text style={styles.statusValue}>Bom</Text>
              <View style={styles.statusDot} />
            </Animated.View>
          </View>
          <Text style={styles.statusDescription}>Nível adequado.</Text>

          <View style={styles.statusDetails}>
            <View style={styles.recommendedRow}>
              <Text style={styles.recommendedLabel}>Faixa recomendada</Text>
              <Text style={styles.recommendedValue}>30% – 90%</Text>
            </View>

            <View style={styles.levelTrack}>
              <View style={styles.recommendedRange} />
              <View style={styles.currentLevelMarker} />
            </View>

            <View style={styles.statusMetrics}>
              <View style={styles.statusMetricItem}>
                <Text style={styles.statusMetricLabel}>Nível atual</Text>
                <Text style={styles.statusMetricValue}>{animatedLevel}%</Text>
              </View>
              <View style={styles.statusMetricDivider} />
              <View style={styles.statusMetricItem}>
                <Text style={styles.statusMetricLabel}>Margem segura</Text>
                <Text style={styles.statusMetricValue}>+{animatedMargin}%</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <AskAssistantButton
          label="Perguntar se há risco de faltar água"
          prompt="Analise o nível da caixa d’água: nível atual 82%, volume estimado 820 litros, capacidade total 1.000 litros e faixa recomendada de 30% a 90%. Existe risco de faltar água?"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    gap: 14,
  },
  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: Colors.navySoft,
  },
  backIcon: {
    marginTop: -4,
    color: Colors.white,
    fontSize: 38,
    fontWeight: "300",
  },
  title: {
    flex: 1,
    color: Colors.white,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  headerPlaceholder: {
    width: 44,
  },
  tankSection: {
    minHeight: 310,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "#071F36",
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.16)",
  },
  scale: {
    position: "absolute",
    top: 48,
    bottom: 44,
    left: 10,
    justifyContent: "space-between",
  },
  scaleItem: {
    width: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scaleText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
  scaleLine: {
    width: 11,
    height: 1,
    backgroundColor: Colors.muted,
  },
  tankBody: {
    position: "absolute",
    bottom: 54,
    width: 190,
    height: 190,
    overflow: "hidden",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: "rgba(103, 158, 190, 0.16)",
    borderWidth: 3,
    borderColor: "#6E8DA3",
  },
  water: {
    position: "absolute",
    right: 3,
    bottom: 3,
    left: 3,
    overflow: "visible",
    backgroundColor: "rgba(13, 144, 211, 0.78)",
  },
  waterSurface: {
    position: "absolute",
    top: -11,
    left: -2,
    right: -2,
    height: 22,
    borderRadius: 50,
    backgroundColor: "#2DADE4",
    borderWidth: 1,
    borderColor: "#7DD9FF",
  },
  tankTop: {
    position: "absolute",
    top: 54,
    width: 190,
    height: 35,
    borderRadius: 50,
    backgroundColor: "rgba(121, 157, 181, 0.34)",
    borderWidth: 3,
    borderColor: "#7893A7",
  },
  tankLid: {
    position: "absolute",
    top: 43,
    width: 58,
    height: 15,
    borderRadius: 20,
    backgroundColor: "#8298A8",
    borderWidth: 2,
    borderColor: "#A7BAC7",
  },
  tankBase: {
    position: "absolute",
    bottom: 42,
    width: 210,
    height: 30,
    borderRadius: 50,
    backgroundColor: "#27445A",
    borderWidth: 2,
    borderColor: "#607F96",
  },
  tankShadow: {
    position: "absolute",
    bottom: 31,
    width: 230,
    height: 24,
    borderRadius: 50,
    backgroundColor: "rgba(0, 0, 0, 0.42)",
  },
  tankHighlight: {
    position: "absolute",
    top: 20,
    bottom: 20,
    left: 15,
    width: 7,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  levelBadge: {
    position: "absolute",
    top: 103,
    right: 16,
    minWidth: 58,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#A8DCFF",
  },
  levelBadgeText: {
    color: "#06345D",
    fontSize: 22,
    fontWeight: "900",
  },
  detailsCard: {
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: Colors.navySoft,
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.16)",
  },
  detailRow: {
    minHeight: 57,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailLabel: {
    color: Colors.bluePale,
    fontSize: 16,
    fontWeight: "600",
  },
  detailValue: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "900",
  },
  detailDivider: {
    height: 1,
    backgroundColor: "rgba(156, 199, 223, 0.16)",
  },
  statusCard: {
    flex: 1,
    minHeight: 210,
    padding: 16,
    borderRadius: 18,
    backgroundColor: Colors.navySoft,
    borderWidth: 1,
    borderColor: "rgba(98, 216, 120, 0.18)",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLabel: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
  },
  statusValueArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  statusValue: {
    color: "#62E77F",
    fontSize: 18,
    fontWeight: "900",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#62E77F",
  },
  statusDescription: {
    marginTop: 10,
    color: Colors.bluePale,
    fontSize: 15,
  },
  statusDetails: {
    flex: 1,
    minHeight: 120,
    marginTop: 18,
    paddingTop: 16,
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(156, 199, 223, 0.14)",
  },
  recommendedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recommendedLabel: {
    color: Colors.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  recommendedValue: {
    color: Colors.bluePale,
    fontSize: 16,
    fontWeight: "900",
  },
  levelTrack: {
    position: "relative",
    height: 12,
    marginVertical: 14,
    borderRadius: 6,
    backgroundColor: "#061A2F",
  },
  recommendedRange: {
    position: "absolute",
    left: "30%",
    width: "60%",
    height: "100%",
    borderRadius: 6,
    backgroundColor: "rgba(98, 216, 120, 0.42)",
  },
  currentLevelMarker: {
    position: "absolute",
    left: "82%",
    top: -4,
    width: 5,
    height: 20,
    marginLeft: -2,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  statusMetrics: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 13,
    backgroundColor: "rgba(77, 182, 232, 0.08)",
  },
  statusMetricItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statusMetricDivider: {
    width: 1,
    height: 34,
    backgroundColor: "rgba(156, 199, 223, 0.18)",
  },
  statusMetricLabel: {
    color: Colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  statusMetricValue: {
    color: Colors.white,
    fontSize: 23,
    fontWeight: "900",
  },
});
