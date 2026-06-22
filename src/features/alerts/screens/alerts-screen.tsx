import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { AppIcon } from "@/shared/components/app-icon";
import { Colors } from "@/shared/constants/colors";
import { AskAssistantButton } from "@/features/assistant/components/ask-assistant-button";

type AlertItem = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  severity: "critical" | "warning" | "resolved";
};

type AlertFilter = "all" | "unread" | "critical" | "warning";

const filters: { key: AlertFilter; label: string }[] = [
  { key: "all", label: "Todos os alertas" },
  { key: "unread", label: "Não lidos" },
  { key: "critical", label: "Críticos" },
  { key: "warning", label: "Avisos" },
];

const activeAlerts: AlertItem[] = [
  {
    id: 1,
    title: "pH fora da faixa ideal",
    description: "O pH está abaixo da faixa recomendada.",
    date: "20/06/2026",
    time: "15:22",
    severity: "critical",
  },
  {
    id: 2,
    title: "Turbidez elevada",
    description: "Valor acima do limite recomendado.",
    date: "20/06/2026",
    time: "14:58",
    severity: "warning",
  },
  {
    id: 3,
    title: "Nível da caixa baixo",
    description: "Nível atual abaixo de 20%.",
    date: "20/06/2026",
    time: "13:10",
    severity: "warning",
  },
  {
    id: 6,
    title: "Temperatura acima do esperado",
    description: "A água atingiu 28,4°C no último monitoramento.",
    date: "20/06/2026",
    time: "12:42",
    severity: "warning",
  },
  {
    id: 7,
    title: "Sensor sem comunicação",
    description: "O sensor da caixa principal não responde há 10 minutos.",
    date: "20/06/2026",
    time: "11:36",
    severity: "critical",
  },
  {
    id: 8,
    title: "Variação rápida de pH",
    description: "Foi detectada uma alteração acima de 0,8 em poucos minutos.",
    date: "20/06/2026",
    time: "10:18",
    severity: "warning",
  },
  {
    id: 9,
    title: "Turbidez crítica",
    description: "A medição ultrapassou 3,0 NTU e requer verificação.",
    date: "20/06/2026",
    time: "09:05",
    severity: "critical",
  },
  {
    id: 10,
    title: "Nível em queda contínua",
    description: "O nível da caixa caiu mais de 15% durante a última hora.",
    date: "20/06/2026",
    time: "08:27",
    severity: "warning",
  },
];

const alertHistory: AlertItem[] = [
  {
    id: 4,
    title: "Qualidade da água normalizada",
    description: "Os indicadores retornaram à faixa recomendada.",
    date: "19/06/2026",
    time: "18:40",
    severity: "resolved",
  },
  {
    id: 5,
    title: "Nível da caixa recuperado",
    description: "O nível voltou a ficar acima de 50%.",
    date: "18/06/2026",
    time: "09:15",
    severity: "resolved",
  },
];

const severityColors = {
  critical: "#FF6B6B",
  warning: "#FFD052",
  resolved: "#62D878",
} as const;

function AlertCard({
  item,
  index,
  landscape,
  read,
  onMarkRead,
}: {
  item: AlertItem;
  index: number;
  landscape: boolean;
  read: boolean;
  onMarkRead: () => void;
}) {
  const color = severityColors[item.severity];

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70).duration(360)}
      style={[styles.alertCardWrapper, landscape && styles.alertCardWrapperLandscape]}
    >
      <View style={[styles.alertCard, read && styles.alertCardRead]}>
      <View style={[styles.severityBar, { backgroundColor: color }]} />
      <View style={[styles.alertIcon, { backgroundColor: `${color}20` }]}>
        <AppIcon name={item.severity === "resolved" ? "info" : "alert"} color={color} size={29} />
      </View>

      <View style={styles.alertContent}>
        <View style={styles.alertHeading}>
          <Text style={styles.alertTitle}>{item.title}</Text>
          {!read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.alertDescription}>{item.description}</Text>
        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <AppIcon name="calendar" color={Colors.blueLight} size={17} />
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
          <View style={styles.dateItem}>
            <AppIcon name="clock" color={Colors.blueLight} size={17} />
            <Text style={styles.dateText}>{item.time}</Text>
          </View>
        </View>
        <View style={styles.assistantAction}>
          <AskAssistantButton
            label="Entender este alerta"
            compact
            prompt={`Explique este alerta do HidroAlerta: “${item.title}”. Detalhes: ${item.description} Ocorrido em ${item.date} às ${item.time}, classificação ${item.severity}. Explique possíveis causas e o que devo verificar.`}
          />
        </View>
        <Pressable
          style={[styles.readButton, read && styles.readButtonDone]}
          onPress={onMarkRead}
          disabled={read}
          accessibilityRole="button"
          accessibilityLabel={read ? "Alerta já lido" : "Marcar alerta como lido"}
        >
          <AppIcon name="check" color={read ? Colors.muted : Colors.blueLight} size={18} />
          <Text style={[styles.readButtonText, read && styles.readButtonTextDone]}>
            {read ? "Lido" : "Marcar como lido"}
          </Text>
        </Pressable>
      </View>
      </View>
    </Animated.View>
  );
}

export default function AlertsScreen() {
  const [tab, setTab] = useState<"active" | "history">("active");
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<AlertFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<number>>(
    () => new Set(alertHistory.map((item) => item.id)),
  );
  const [clearedHistoryIds, setClearedHistoryIds] = useState<Set<number>>(() => new Set());
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const compactControls = width < 430;
  const readActiveAlerts = activeAlerts.filter((item) => readIds.has(item.id));
  const sourceAlerts =
    tab === "active"
      ? activeAlerts.filter((item) => !readIds.has(item.id))
      : [...readActiveAlerts, ...alertHistory].filter((item) => !clearedHistoryIds.has(item.id));
  const filteredAlerts = sourceAlerts.filter((item) => {
    if (filter === "unread") return !readIds.has(item.id);
    if (filter === "critical") return item.severity === "critical";
    if (filter === "warning") return item.severity === "warning";
    return true;
  });
  const visibleAlerts = tab === "active" && !showAll ? filteredAlerts.slice(0, 2) : filteredAlerts;
  const unreadActiveCount = activeAlerts.filter((item) => !readIds.has(item.id)).length;
  const selectedFilter = filters.find((item) => item.key === filter) ?? filters[0];
  const hasAlerts = sourceAlerts.length > 0;

  function markAsRead(id: number) {
    setReadIds((current) => new Set(current).add(id));
  }

  function markAllAsRead() {
    setReadIds(new Set([...activeAlerts, ...alertHistory].map((item) => item.id)));
  }

  function clearHistory() {
    setClearedHistoryIds((current) => {
      const next = new Set(current);
      sourceAlerts.forEach((item) => next.add(item.id));
      return next;
    });
  }

  return (
    <>
    <ScrollView
      contentContainerStyle={[styles.page, isLandscape && styles.pageLandscape]}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      <View style={styles.content}>
        <Text style={styles.title}>Alertas</Text>

        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, tab === "active" && styles.tabActive]}
            onPress={() => setTab("active")}
          >
            <Text style={[styles.tabText, tab === "active" && styles.tabTextActive]}>Ativos</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadActiveCount}</Text>
            </View>
          </Pressable>
          <Pressable
            style={[styles.tab, tab === "history" && styles.tabActive]}
            onPress={() => setTab("history")}
          >
            <Text style={[styles.tabText, tab === "history" && styles.tabTextActive]}>Histórico</Text>
          </Pressable>
        </View>

        {hasAlerts && <View style={[styles.filterControls, compactControls && styles.filterControlsCompact]}>
          <Pressable style={styles.filterButton} onPress={() => setFilterOpen(true)}>
            <Text style={styles.filterButtonText}>{selectedFilter.label}</Text>
            <AppIcon name="chevron" color={Colors.bluePale} size={18} />
          </Pressable>
          <Pressable
            style={[styles.markAllButton, tab === "history" && styles.clearHistoryButton]}
            onPress={tab === "active" ? markAllAsRead : clearHistory}
          >
            <AppIcon
              name={tab === "active" ? "check" : "trash"}
              color={tab === "active" ? Colors.navy : Colors.white}
              size={19}
            />
            <Text
              style={[
                styles.markAllButtonText,
                tab === "history" && styles.clearHistoryButtonText,
              ]}
            >
              {tab === "active" ? "Marcar todos como lidos" : "Limpar histórico"}
            </Text>
          </Pressable>
        </View>}

        <View style={[styles.alertsGrid, isLandscape && styles.alertsGridLandscape]}>
          {visibleAlerts.map((item, index) => (
            <AlertCard
              key={item.id}
              item={item}
              index={index}
              landscape={isLandscape}
              read={readIds.has(item.id)}
              onMarkRead={() => markAsRead(item.id)}
            />
          ))}
        </View>

        {visibleAlerts.length === 0 && (
          <View style={styles.emptyState}>
            <AppIcon name="check" color="#62D878" size={38} />
            <Text style={styles.emptyStateTitle}>Nenhum alerta encontrado</Text>
          </View>
        )}

        {tab === "active" && unreadActiveCount > 0 && (
          <Pressable style={styles.showAllButton} onPress={() => setShowAll((current) => !current)}>
            <Text style={styles.showAllText}>{showAll ? "Mostrar menos" : "Ver todos os alertas"}</Text>
          </Pressable>
        )}

        {tab === "history" && hasAlerts && (
          <View style={styles.historySummary}>
            <Text style={styles.historySummaryText}>
              {sourceAlerts.length} alertas lidos ou resolvidos
            </Text>
          </View>
        )}
      </View>
    </ScrollView>

      <Modal transparent animationType="fade" visible={filterOpen} onRequestClose={() => setFilterOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setFilterOpen(false)} />
          <View style={styles.filterMenu}>
            <Text style={styles.filterMenuTitle}>Filtrar alertas</Text>
            {filters.map((item) => {
              const selected = item.key === filter;
              return (
                <Pressable
                  key={item.key}
                  style={[styles.filterOption, selected && styles.filterOptionSelected]}
                  onPress={() => {
                    setFilter(item.key);
                    setShowAll(true);
                    setFilterOpen(false);
                  }}
                >
                  <Text style={[styles.filterOptionText, selected && styles.filterOptionTextSelected]}>
                    {item.label}
                  </Text>
                  {selected && <AppIcon name="check" color={Colors.navy} size={20} />}
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
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    gap: 15,
  },
  title: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  tabs: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    padding: 4,
    borderRadius: 15,
    backgroundColor: "#08243E",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: "#0D355A",
    borderBottomWidth: 2,
    borderBottomColor: Colors.blueLight,
  },
  tabText: {
    color: Colors.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  tabTextActive: {
    color: Colors.white,
    fontWeight: "900",
  },
  filterControls: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
  },
  filterControlsCompact: {
    flexDirection: "column",
  },
  filterButton: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 13,
    backgroundColor: Colors.navySoft,
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.24)",
  },
  filterButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  markAllButton: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 13,
    backgroundColor: Colors.blueLight,
  },
  markAllButtonText: {
    color: Colors.navy,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  clearHistoryButton: {
    backgroundColor: "#A84750",
  },
  clearHistoryButtonText: {
    color: Colors.white,
  },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "#C94B54",
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "900",
  },
  alertsGrid: {
    width: "100%",
    gap: 10,
  },
  alertsGridLandscape: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "stretch",
  },
  alertCardWrapper: {
    width: "100%",
  },
  alertCardWrapperLandscape: {
    width: "48%",
  },
  alertCard: {
    width: "100%",
    minHeight: 160,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: Colors.navySoft,
    borderWidth: 1,
    borderColor: "rgba(156, 199, 223, 0.22)",
  },
  alertCardRead: {
    opacity: 0.68,
    backgroundColor: "#09243C",
  },
  severityBar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 5,
  },
  alertIcon: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    alignSelf: "center",
  },
  alertContent: {
    flex: 1,
    alignSelf: "stretch",
  },
  alertHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.blueLight,
  },
  alertTitle: {
    flex: 1,
    color: Colors.white,
    fontSize: 17,
    fontWeight: "900",
  },
  alertDescription: {
    marginTop: 5,
    color: Colors.bluePale,
    fontSize: 13,
    lineHeight: 19,
  },
  dateRow: {
    width: "100%",
    marginTop: "auto",
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  dateItem: {
    flex: 1,
    minHeight: 34,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    backgroundColor: "rgba(77, 182, 232, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.18)",
  },
  dateText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "800",
  },
  assistantAction: {
    width: "100%",
    marginTop: 12,
  },
  readButton: {
    width: "100%",
    minHeight: 36,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 10,
    backgroundColor: "rgba(77, 182, 232, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.28)",
  },
  readButtonDone: {
    backgroundColor: "rgba(156, 199, 223, 0.08)",
    borderColor: "rgba(156, 199, 223, 0.14)",
  },
  readButtonText: {
    color: Colors.blueLight,
    fontSize: 12,
    fontWeight: "800",
  },
  readButtonTextDone: {
    color: Colors.muted,
  },
  showAllButton: {
    width: "100%",
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "#1268B8",
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.35)",
  },
  showAllText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "900",
  },
  historySummary: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "rgba(98, 216, 120, 0.1)",
  },
  historySummaryText: {
    color: "#7EE491",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyState: {
    minHeight: 190,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 18,
    backgroundColor: Colors.navySoft,
  },
  emptyStateTitle: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "900",
  },
  modalRoot: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.overlay,
  },
  filterMenu: {
    width: "100%",
    maxWidth: 340,
    padding: 14,
    borderRadius: 22,
    backgroundColor: Colors.navySoft,
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.35)",
  },
  filterMenuTitle: {
    padding: 10,
    color: Colors.white,
    fontSize: 18,
    fontWeight: "900",
  },
  filterOption: {
    minHeight: 48,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 13,
  },
  filterOptionSelected: {
    backgroundColor: Colors.blueLight,
  },
  filterOptionText: {
    color: Colors.bluePale,
    fontSize: 15,
    fontWeight: "700",
  },
  filterOptionTextSelected: {
    color: Colors.navy,
    fontWeight: "900",
  },
});
