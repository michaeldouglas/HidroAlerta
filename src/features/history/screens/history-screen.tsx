import { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import Animated, { FadeIn } from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

import { AppIcon } from "@/shared/components/app-icon";
import { Colors } from "@/shared/constants/colors";
import { AskAssistantButton } from "@/features/assistant/components/ask-assistant-button";

type MetricKey = "ph" | "turbidity" | "level" | "temperature";
type Period = "24h" | "7d" | "30d";

const periods: { key: Period; label: string }[] = [
  { key: "24h", label: "Últimas 24 horas" },
  { key: "7d", label: "Últimos 7 dias" },
  { key: "30d", label: "Últimos 30 dias" },
];

const metrics = {
  ph: {
    label: "pH",
    color: "#62D878",
    minY: 5,
    maxY: 9,
    decimals: 1,
    unit: "",
    values: [7.2, 7.5, 7.1, 7.3, 7.0, 6.9, 7.1, 7.0, 7.2, 7.1, 7.4, 7.2, 7.3, 7.2, 6.9, 6.6, 6.8, 7.2, 7.3, 7.0, 6.8, 7.0, 6.7, 6.9, 7.1],
    stats: [
      { label: "Mínimo", value: "6,8", time: "15:20" },
      { label: "Médio", value: "7,1", time: "" },
      { label: "Máximo", value: "7,4", time: "09:45" },
    ],
  },
  turbidity: {
    label: "Turbidez",
    color: "#3BA8FF",
    minY: 0,
    maxY: 3,
    decimals: 1,
    unit: " NTU",
    values: [1.1, 1.2, 1.0, 1.4, 1.3, 1.2, 1.1, 1.3, 1.5, 1.4, 1.2, 1.1, 1.0, 1.3, 1.7, 2.1, 1.6, 1.4, 1.2, 1.1, 1.3, 1.4, 1.2, 1.1, 1.3],
    stats: [
      { label: "Mínimo", value: "0,8", time: "05:10" },
      { label: "Médio", value: "1,3", time: "" },
      { label: "Máximo", value: "2,1", time: "06:35" },
    ],
  },
  level: {
    label: "Nível",
    color: "#35B8F2",
    minY: 60,
    maxY: 100,
    decimals: 0,
    unit: "%",
    values: [88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75, 74, 76, 78, 80, 81, 82, 83, 84, 83, 82, 82],
    stats: [
      { label: "Mínimo", value: "74%", time: "05:50" },
      { label: "Médio", value: "82%", time: "" },
      { label: "Máximo", value: "91%", time: "15:00" },
    ],
  },
  temperature: {
    label: "Temperatura",
    color: "#45D7C7",
    minY: 20,
    maxY: 28,
    decimals: 1,
    unit: "°C",
    values: [23.2, 23.0, 22.9, 22.8, 23.0, 23.4, 23.8, 24.2, 24.5, 24.7, 24.9, 25.2, 25.4, 25.6, 25.3, 25.0, 24.8, 24.6, 24.5, 24.3, 24.2, 24.1, 24.0, 24.0, 24.1],
    stats: [
      { label: "Mínimo", value: "22,8°C", time: "21:40" },
      { label: "Médio", value: "24,1°C", time: "" },
      { label: "Máximo", value: "25,6°C", time: "09:20" },
    ],
  },
} as const;

const chart = {
  width: 340,
  height: 225,
  left: 42,
  right: 330,
  top: 18,
  bottom: 182,
};

function formatValue(value: number, decimals: number, unit: string) {
  return `${value.toFixed(decimals).replace(".", ",")}${unit}`;
}

function createReportHtml(metric: (typeof metrics)[MetricKey], periodLabel: string) {
  const generatedAt = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());
  const readings = metric.values
    .map(
      (value, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${formatValue(value, metric.decimals, metric.unit)}</td>
        </tr>`,
    )
    .join("");
  const stats = metric.stats
    .map(
      (stat) => `
        <div class="stat">
          <span>${stat.label}</span>
          <strong>${stat.value}</strong>
          <small>${stat.time || "Média do período"}</small>
        </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          @page { margin: 28px; }
          * { box-sizing: border-box; }
          body { margin: 0; color: #17324a; font-family: Arial, sans-serif; }
          .header { padding: 24px; color: white; border-radius: 16px; background: #0a2947; }
          .brand { margin: 0; color: #7dd3fc; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; }
          h1 { margin: 7px 0 5px; font-size: 28px; }
          .period { margin: 0; color: #c7eafb; font-size: 14px; }
          .stats { display: flex; gap: 10px; margin: 18px 0; }
          .stat { flex: 1; padding: 14px; border: 1px solid #d6e5ef; border-top: 4px solid ${metric.color}; border-radius: 10px; }
          .stat span, .stat small { display: block; color: #607d91; font-size: 11px; }
          .stat strong { display: block; margin: 6px 0; font-size: 22px; }
          h2 { margin: 22px 0 9px; font-size: 17px; }
          table { width: 100%; border-collapse: collapse; }
          th { color: white; background: #0d5ea6; }
          th, td { padding: 8px 11px; border: 1px solid #dbe7ef; text-align: left; font-size: 12px; }
          tr:nth-child(even) { background: #f3f8fb; }
          .footer { margin-top: 18px; color: #718a9b; font-size: 10px; text-align: center; }
        </style>
      </head>
      <body>
        <section class="header">
          <p class="brand">HidroAlerta</p>
          <h1>Relatório de ${metric.label}</h1>
          <p class="period">${periodLabel} • Gerado em ${generatedAt}</p>
        </section>
        <section class="stats">${stats}</section>
        <h2>Leituras do período</h2>
        <table>
          <thead><tr><th>Leitura</th><th>Valor</th></tr></thead>
          <tbody>${readings}</tbody>
        </table>
        <p class="footer">Relatório gerado pelo HidroAlerta — Sensores inteligentes e Inteligência Artificial.</p>
      </body>
    </html>`;
}

function HistoryChart({ metricKey }: { metricKey: MetricKey }) {
  const metric = metrics[metricKey];
  const points = useMemo(
    () =>
      metric.values.map((value, index) => {
        const x = chart.left + (index / (metric.values.length - 1)) * (chart.right - chart.left);
        const y =
          chart.bottom -
          ((value - metric.minY) / (metric.maxY - metric.minY)) * (chart.bottom - chart.top);
        return { x, y, value };
      }),
    [metric],
  );
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L${chart.right},${chart.bottom} L${chart.left},${chart.bottom} Z`;
  const lastPoint = points[points.length - 1];
  const yTicks = Array.from({ length: 5 }, (_, index) => metric.maxY - index * ((metric.maxY - metric.minY) / 4));
  const xLabels = ["15:00", "21:00", "03:00", "09:00", "15:00"];

  return (
    <Animated.View key={metricKey} entering={FadeIn.duration(280)} style={styles.chartWrap}>
      <Svg width="100%" height={chart.height} viewBox={`0 0 ${chart.width} ${chart.height}`}>
        <Defs>
          <LinearGradient id={`area-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={metric.color} stopOpacity="0.38" />
            <Stop offset="1" stopColor={metric.color} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {yTicks.map((tick, index) => {
          const y = chart.top + (index / 4) * (chart.bottom - chart.top);
          return (
            <G key={tick}>
              <Line x1={chart.left} y1={y} x2={chart.right} y2={y} stroke="#24465F" strokeWidth="1" />
              <SvgText x="32" y={y + 4} fill="#C4D9E7" fontSize="11" textAnchor="end">
                {tick.toFixed(metric.decimals).replace(".", ",")}
              </SvgText>
            </G>
          );
        })}

        {xLabels.map((label, index) => {
          const x = chart.left + (index / 4) * (chart.right - chart.left);
          return (
            <G key={label + index}>
              <Line x1={x} y1={chart.top} x2={x} y2={chart.bottom} stroke="#193C57" strokeWidth="1" />
              <SvgText x={x} y="207" fill="#C4D9E7" fontSize="10" textAnchor="middle">
                {label}
              </SvgText>
            </G>
          );
        })}

        <Path d={areaPath} fill={`url(#area-${metricKey})`} />
        <Path d={linePath} fill="none" stroke={metric.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <Circle cx={lastPoint.x} cy={lastPoint.y} r="5" fill={metric.color} stroke="#E9FFF0" strokeWidth="2" />

        <Rect x={lastPoint.x - 48} y={Math.max(5, lastPoint.y - 54)} width="45" height="38" rx="7" fill="#82CBFF" />
        <SvgText x={lastPoint.x - 25} y={Math.max(19, lastPoint.y - 40)} fill="#06213B" fontSize="11" fontWeight="700" textAnchor="middle">
          {formatValue(lastPoint.value, metric.decimals, metric.unit)}
        </SvgText>
        <SvgText x={lastPoint.x - 25} y={Math.max(33, lastPoint.y - 26)} fill="#06213B" fontSize="10" textAnchor="middle">
          15:30
        </SvgText>
      </Svg>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const [metricKey, setMetricKey] = useState<MetricKey>("ph");
  const [period, setPeriod] = useState<Period>("24h");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const metric = metrics[metricKey];
  const selectedPeriod = periods.find((item) => item.key === period) ?? periods[0];

  async function exportPdf() {
    setExporting(true);
    setExportMessage("");
    try {
      const html = createReportHtml(metric, selectedPeriod.label);

      if (Platform.OS === "web") {
        const reportWindow = window.open("", "_blank", "width=900,height=700");
        if (!reportWindow) {
          throw new Error("O navegador bloqueou a janela do relatório.");
        }

        reportWindow.document.open();
        reportWindow.document.write(html);
        reportWindow.document.close();
        reportWindow.focus();
        window.setTimeout(() => reportWindow.print(), 250);
        setExportMessage("Use a opção “Salvar como PDF” na janela de impressão.");
        return;
      }

      const { uri, base64 } = await Print.printToFileAsync({ html, base64: true });
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (sharingAvailable) {
        if (!base64 || !FileSystem.cacheDirectory) {
          throw new Error("Não foi possível preparar o arquivo para compartilhamento.");
        }

        const shareUri = `${FileSystem.cacheDirectory}hidroalerta-relatorio-${Date.now()}.pdf`;
        await FileSystem.writeAsStringAsync(shareUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Sharing.shareAsync(shareUri, {
          dialogTitle: `Relatório de ${metric.label}`,
          mimeType: "application/pdf",
          UTI: ".pdf",
        });
      } else {
        await Print.printAsync({ uri });
      }

      setExportMessage("Relatório PDF gerado com sucesso.");
    } catch (error) {
      console.error("Falha ao gerar relatório PDF", error);
      setExportMessage("Não foi possível gerar o relatório. Tente novamente.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.page, isLandscape && styles.pageLandscape]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Histórico</Text>

          <Pressable style={styles.periodButton} onPress={() => setPeriodOpen(true)}>
            <Text style={styles.periodText}>{selectedPeriod.label}</Text>
            <AppIcon name="chevron" color={Colors.bluePale} size={18} />
          </Pressable>

          <View style={styles.tabs}>
            {(Object.keys(metrics) as MetricKey[]).map((key) => {
              const active = key === metricKey;
              return (
                <Pressable
                  key={key}
                  style={[styles.tab, active && styles.tabActive]}
                  onPress={() => setMetricKey(key)}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {metrics[key].label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.chartCard}>
            <HistoryChart metricKey={metricKey} />
          </View>

          <View style={styles.statsRow}>
            {metric.stats.map((stat, index) => (
              <View
                key={stat.label}
                style={[
                  styles.statCard,
                  index === 0 && styles.statCardMinimum,
                  index === 1 && styles.statCardAverage,
                  index === 2 && styles.statCardMaximum,
                ]}
              >
                <View
                  style={[
                    styles.statAccent,
                    index === 0 && styles.statAccentMinimum,
                    index === 1 && styles.statAccentAverage,
                    index === 2 && styles.statAccentMaximum,
                  ]}
                />
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTime}>{stat.time || "Média do período"}</Text>
              </View>
            ))}
          </View>

          <AskAssistantButton
            label="Explicar esta tendência"
            prompt={`Explique a tendência de ${metric.label} no período ${selectedPeriod.label}. Os dados mostram mínimo ${metric.stats[0].value}, média ${metric.stats[1].value} e máximo ${metric.stats[2].value}. Destaque riscos e recomendações.`}
          />

          <Pressable
            style={({ pressed }) => [
              styles.exportButton,
              pressed && styles.exportButtonPressed,
              exporting && styles.exportButtonDisabled,
            ]}
            onPress={exportPdf}
            disabled={exporting}
            accessibilityRole="button"
            accessibilityLabel="Baixar relatório em PDF"
          >
            <AppIcon name="download" color={Colors.navy} size={21} />
            <Text style={styles.exportButtonText}>
              {exporting ? "Gerando relatório..." : "Baixar relatório em PDF"}
            </Text>
          </Pressable>
          {exportMessage ? <Text style={styles.exportMessage}>{exportMessage}</Text> : null}

        </View>
      </ScrollView>

      <Modal transparent animationType="fade" visible={periodOpen} onRequestClose={() => setPeriodOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPeriodOpen(false)} />
          <View style={styles.periodMenu}>
            <Text style={styles.periodMenuTitle}>Período do histórico</Text>
            {periods.map((item) => {
              const selected = item.key === period;
              return (
                <Pressable
                  key={item.key}
                  style={[styles.periodOption, selected && styles.periodOptionSelected]}
                  onPress={() => {
                    setPeriod(item.key);
                    setPeriodOpen(false);
                  }}
                >
                  <Text style={[styles.periodOptionText, selected && styles.periodOptionTextSelected]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
    paddingHorizontal: 32,
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    gap: 14,
  },
  title: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  periodButton: {
    width: "100%",
    minHeight: 44,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 15,
    backgroundColor: Colors.navySoft,
    borderWidth: 1,
    borderColor: "rgba(156, 199, 223, 0.28)",
  },
  periodText: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  tabs: {
    width: "100%",
    flexDirection: "row",
    gap: 5,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "#176CC2",
  },
  tabText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  tabTextActive: {
    fontWeight: "900",
  },
  chartCard: {
    width: "100%",
    paddingTop: 8,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#08253F",
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.18)",
  },
  chartWrap: {
    width: "100%",
  },
  statsRow: {
    flex: 1,
    minHeight: 135,
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    minHeight: 135,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.navySoft,
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.12)",
  },
  statCardMinimum: {
    backgroundColor: "#0A315A",
    borderColor: "rgba(59, 168, 255, 0.42)",
  },
  statCardAverage: {
    backgroundColor: "#0B3B3B",
    borderColor: "rgba(98, 216, 120, 0.42)",
  },
  statCardMaximum: {
    backgroundColor: "#45301E",
    borderColor: "rgba(255, 178, 89, 0.42)",
  },
  statAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
  },
  statAccentMinimum: {
    backgroundColor: "#3BA8FF",
  },
  statAccentAverage: {
    backgroundColor: "#62D878",
  },
  statAccentMaximum: {
    backgroundColor: "#FFB259",
  },
  statLabel: {
    color: Colors.bluePale,
    fontSize: 14,
    fontWeight: "700",
  },
  statValue: {
    marginTop: 7,
    color: Colors.white,
    fontSize: 28,
    fontWeight: "900",
  },
  statTime: {
    minHeight: 16,
    marginTop: 4,
    color: Colors.muted,
    fontSize: 11,
    textAlign: "center",
  },
  exportButton: {
    width: "100%",
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 15,
    backgroundColor: Colors.blueLight,
  },
  exportButtonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
  exportButtonDisabled: {
    opacity: 0.55,
  },
  exportButtonText: {
    color: Colors.navy,
    fontSize: 14,
    fontWeight: "900",
  },
  exportMessage: {
    marginTop: -5,
    color: Colors.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
  modalRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: Colors.overlay,
  },
  periodMenu: {
    width: "100%",
    maxWidth: 330,
    padding: 14,
    borderRadius: 22,
    backgroundColor: Colors.navySoft,
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.35)",
  },
  periodMenuTitle: {
    padding: 10,
    color: Colors.white,
    fontSize: 17,
    fontWeight: "800",
  },
  periodOption: {
    minHeight: 48,
    paddingHorizontal: 12,
    justifyContent: "center",
    borderRadius: 13,
  },
  periodOptionSelected: {
    backgroundColor: Colors.blueLight,
  },
  periodOptionText: {
    color: Colors.bluePale,
    fontSize: 15,
    fontWeight: "600",
  },
  periodOptionTextSelected: {
    color: Colors.navy,
    fontWeight: "900",
  },
});
