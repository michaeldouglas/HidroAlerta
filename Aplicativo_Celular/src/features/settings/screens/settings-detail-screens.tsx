import { useCallback, useEffect, useState } from "react";
import { Linking, Modal, Platform, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import * as Network from "expo-network";

import { SettingsShell } from "@/features/settings/components/settings-shell";
import { type UnitSystem, useSettings } from "@/features/settings/context/settings-context";
import { AppIcon } from "@/shared/components/app-icon";
import { Colors } from "@/shared/constants/colors";

type SelectionRowProps = {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
};

function SelectionRow({ title, description, selected, onPress }: SelectionRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, selected && styles.rowSelected, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

type ToggleRowProps = {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function ToggleRow({ title, description, value, onValueChange }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#24445F", true: Colors.blue }}
        thumbColor={value ? Colors.blueLight : Colors.muted}
      />
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function Feedback({ children }: { children: string }) {
  return (
    <View style={styles.feedback}>
      <AppIcon name="check" color="#62D878" size={19} />
      <Text style={styles.feedbackText}>{children}</Text>
    </View>
  );
}

export function UnitsSettingsScreen() {
  const { unitSystem, setUnitSystem } = useSettings();
  const options: { key: UnitSystem; title: string; description: string }[] = [
    { key: "metric", title: "Sistema métrico", description: "Litros, graus Celsius e centímetros" },
    { key: "imperial", title: "Sistema imperial", description: "Galões, graus Fahrenheit e polegadas" },
  ];

  return (
    <SettingsShell title="Unidade de medida" description="Escolha como os dados serão exibidos no aplicativo.">
      <SectionTitle>SISTEMA DE MEDIDAS</SectionTitle>
      <View style={styles.card}>
        {options.map((option) => (
          <SelectionRow
            key={option.key}
            title={option.title}
            description={option.description}
            selected={unitSystem === option.key}
            onPress={() => setUnitSystem(option.key)}
          />
        ))}
      </View>
      <Feedback>Preferência aplicada imediatamente às próximas leituras.</Feedback>
    </SettingsShell>
  );
}

export function NotificationsSettingsScreen() {
  const { notifications, setNotification } = useSettings();

  return (
    <SettingsShell title="Notificações" description="Defina quais avisos o HidroAlerta pode enviar.">
      <SectionTitle>TIPOS DE AVISO</SectionTitle>
      <View style={styles.card}>
        <ToggleRow
          title="Alertas críticos"
          description="Valores que exigem verificação imediata"
          value={notifications.critical}
          onValueChange={(value) => setNotification("critical", value)}
        />
        <ToggleRow
          title="Avisos de atenção"
          description="Indicadores próximos dos limites"
          value={notifications.warning}
          onValueChange={(value) => setNotification("warning", value)}
        />
        <ToggleRow
          title="Resumo diário"
          description="Balanço das leituras no fim do dia"
          value={notifications.summaries}
          onValueChange={(value) => setNotification("summaries", value)}
        />
      </View>
    </SettingsShell>
  );
}

type UserItem = { id: number; name: string; role: string; initials: string };

export function UsersSettingsScreen() {
  const [users, setUsers] = useState<UserItem[]>([
    { id: 1, name: "Administrador", role: "Acesso completo", initials: "AD" },
    { id: 2, name: "Convidado", role: "Somente visualização", initials: "CO" },
  ]);
  const [message, setMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [accessRole, setAccessRole] = useState<"Acesso completo" | "Somente visualização">(
    "Somente visualização",
  );

  function addUser() {
    const normalizedName = name.trim();
    if (!normalizedName) {
      return;
    }

    const initials = normalizedName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");

    setUsers((current) => [
      ...current,
      { id: Date.now(), name: normalizedName, role: accessRole, initials },
    ]);
    setMessage(`${normalizedName} foi adicionado com sucesso.`);
    setName("");
    setAccessRole("Somente visualização");
    setFormOpen(false);
  }

  return (
    <>
      <SettingsShell title="Usuários" description="Gerencie quem pode acompanhar este sistema.">
        <View style={styles.headingRow}>
          <SectionTitle>USUÁRIOS ATIVOS</SectionTitle>
          <Text style={styles.counter}>{users.length}</Text>
        </View>
        <View style={styles.card}>
          {users.map((user) => (
            <View key={user.id} style={styles.userRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{user.initials}</Text></View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{user.name}</Text>
                <Text style={styles.rowDescription}>{user.role}</Text>
              </View>
              {user.id !== 1 ? (
                <Pressable
                  style={styles.smallButton}
                  onPress={() => {
                    setUsers((current) => current.filter((item) => item.id !== user.id));
                    setMessage("Usuário removido.");
                  }}
                  accessibilityLabel={`Remover ${user.name}`}
                >
                  <AppIcon name="trash" color="#FF8181" size={19} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          onPress={() => {
            setMessage("");
            setFormOpen(true);
          }}
        >
          <AppIcon name="plus" color={Colors.navy} size={20} />
          <Text style={styles.primaryButtonText}>Adicionar usuário</Text>
        </Pressable>
        {message ? <Feedback>{message}</Feedback> : null}
      </SettingsShell>

      <Modal
        transparent
        animationType="fade"
        visible={formOpen}
        onRequestClose={() => setFormOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setFormOpen(false)} />
          <View style={styles.userModal}>
            <Text style={styles.modalTitle}>Adicionar usuário</Text>
            <Text style={styles.modalDescription}>Informe o nome da pessoa e defina o tipo de acesso.</Text>

            <Text style={styles.inputLabel}>NOME DA PESSOA</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex.: Maria Silva"
              placeholderTextColor={Colors.muted}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={addUser}
            />

            <Text style={styles.inputLabel}>TIPO DE ACESSO</Text>
            {(["Somente visualização", "Acesso completo"] as const).map((role) => {
              const selected = accessRole === role;
              return (
                <Pressable
                  key={role}
                  style={[styles.accessOption, selected && styles.accessOptionSelected]}
                  onPress={() => setAccessRole(role)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{role}</Text>
                    <Text style={styles.rowDescription}>
                      {role === "Acesso completo"
                        ? "Pode visualizar e alterar configurações"
                        : "Pode apenas acompanhar leituras e alertas"}
                    </Text>
                  </View>
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              );
            })}

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setFormOpen(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmButton, !name.trim() && styles.buttonDisabled]}
                onPress={addUser}
                disabled={!name.trim()}
              >
                <Text style={styles.confirmButtonText}>Adicionar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export function NetworkSettingsScreen() {
  const [scanning, setScanning] = useState(false);
  const [networkState, setNetworkState] = useState<Network.NetworkState>({});
  const [ipAddress, setIpAddress] = useState("Verificando...");
  const [status, setStatus] = useState("Consultando conexão atual...");

  const refreshConnection = useCallback(async () => {
    setScanning(true);
    try {
      const [state, ip] = await Promise.all([
        Network.getNetworkStateAsync(),
        Network.getIpAddressAsync(),
      ]);
      setNetworkState(state);
      setIpAddress(ip === "0.0.0.0" ? "Não disponível" : ip);
      setStatus("Informações da conexão atualizadas.");
    } catch {
      setStatus("Não foi possível consultar a conexão neste dispositivo.");
      setIpAddress("Não disponível");
    } finally {
      setScanning(false);
    }
  }, []);

  useEffect(() => {
    const initialRefresh = setTimeout(() => void refreshConnection(), 0);
    const subscription = Network.addNetworkStateListener((state) => {
      setNetworkState(state);
      setStatus("A conexão foi alterada.");
    });

    return () => {
      clearTimeout(initialRefresh);
      subscription.remove();
    };
  }, [refreshConnection]);

  const connectionName = (() => {
    switch (networkState.type) {
      case Network.NetworkStateType.WIFI:
        return "Wi-Fi conectado";
      case Network.NetworkStateType.CELLULAR:
        return "Dados móveis";
      case Network.NetworkStateType.ETHERNET:
        return "Rede cabeada";
      case Network.NetworkStateType.VPN:
        return "Conexão VPN";
      case Network.NetworkStateType.NONE:
        return "Sem conexão";
      default:
        return networkState.isConnected ? "Rede conectada" : "Verificando conexão";
    }
  })();

  const connectionStatus = networkState.isConnected
    ? networkState.isInternetReachable === false
      ? "Conectado, mas sem acesso à internet"
      : "Conectado à internet"
    : "Desconectado";

  async function openNetworkSettings() {
    try {
      if (Platform.OS === "android") {
        await Linking.sendIntent("android.settings.WIFI_SETTINGS");
      } else {
        await Linking.openSettings();
      }
    } catch {
      setStatus("Não foi possível abrir os ajustes deste dispositivo.");
    }
  }

  return (
    <SettingsShell title="Rede e dispositivos" description="Confira a conexão do monitor e procure novos dispositivos.">
      <SectionTitle>REDE ATUAL</SectionTitle>
      <View style={styles.networkHero}>
        <View style={styles.networkIcon}>
          <AppIcon
            name="wifi"
            color={networkState.isConnected ? "#62D878" : Colors.muted}
            size={31}
          />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{connectionName}</Text>
          <Text style={[styles.onlineText, !networkState.isConnected && styles.offlineText]}>
            {connectionStatus}
          </Text>
          <Text style={styles.ipText}>Endereço IP: {ipAddress}</Text>
        </View>
      </View>
      <SectionTitle>DISPOSITIVO CONFIGURADO</SectionTitle>
      <View style={styles.card}>
        <View style={styles.deviceRow}>
          <View style={styles.deviceIcon}><AppIcon name="sensors" color={Colors.blueLight} size={25} /></View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Central HidroAlerta</Text>
            <Text style={styles.rowDescription}>Online • Atualizado há 3s</Text>
          </View>
          <View style={styles.onlineDot} />
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, scanning && styles.buttonDisabled]}
        onPress={refreshConnection}
        disabled={scanning}
      >
        <AppIcon name="refresh" color={Colors.navy} size={20} />
        <Text style={styles.primaryButtonText}>{scanning ? "Atualizando..." : "Atualizar conexão"}</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.networkSettingsButton, pressed && styles.pressed]}
        onPress={openNetworkSettings}
      >
        <AppIcon name="settings" color={Colors.blueLight} size={20} />
        <Text style={styles.networkSettingsButtonText}>
          {Platform.OS === "android" ? "Abrir configurações de Wi-Fi" : "Abrir ajustes de rede"}
        </Text>
      </Pressable>
      <Text style={styles.centerNote}>{status}</Text>
    </SettingsShell>
  );
}

export function BackupSettingsScreen() {
  const { automaticBackup, setAutomaticBackup } = useSettings();
  const [lastAction, setLastAction] = useState("Último backup: hoje, 10:30");

  return (
    <SettingsShell title="Backup e dados" description="Proteja suas configurações e gerencie os dados locais.">
      <SectionTitle>BACKUP</SectionTitle>
      <View style={styles.card}>
        <ToggleRow
          title="Backup automático"
          description="Salvar configurações uma vez por dia"
          value={automaticBackup}
          onValueChange={setAutomaticBackup}
        />
        <View style={styles.dataRow}>
          <AppIcon name="database" color={Colors.blueLight} size={23} />
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Dados armazenados</Text>
            <Text style={styles.rowDescription}>Leituras e preferências • 2,4 MB</Text>
          </View>
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        onPress={() => setLastAction("Backup concluído agora.")}
      >
        <AppIcon name="backup" color={Colors.navy} size={20} />
        <Text style={styles.primaryButtonText}>Fazer backup agora</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        onPress={() => setLastAction("Histórico local limpo. Os sensores continuam conectados.")}
      >
        <AppIcon name="trash" color="#FF8181" size={19} />
        <Text style={styles.secondaryButtonText}>Limpar histórico local</Text>
      </Pressable>
      <Feedback>{lastAction}</Feedback>
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { marginBottom: 8, color: Colors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 1.3 },
  headingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  counter: { marginBottom: 8, color: Colors.blueLight, fontSize: 13, fontWeight: "900" },
  card: { overflow: "hidden", borderRadius: 18, backgroundColor: Colors.navySoft, borderWidth: 1, borderColor: "rgba(77, 182, 232, 0.14)" },
  row: { minHeight: 76, padding: 14, flexDirection: "row", alignItems: "center", gap: 14, borderBottomWidth: 1, borderBottomColor: "rgba(156, 199, 223, 0.11)" },
  rowSelected: { backgroundColor: "rgba(77, 182, 232, 0.12)" },
  rowText: { flex: 1 },
  rowTitle: { color: Colors.white, fontSize: 15, fontWeight: "800" },
  rowDescription: { marginTop: 4, color: Colors.muted, fontSize: 12, lineHeight: 17 },
  radio: { width: 23, height: 23, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 2, borderColor: Colors.muted },
  radioSelected: { borderColor: Colors.blueLight },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: Colors.blueLight },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  feedback: { marginTop: 14, padding: 12, flexDirection: "row", alignItems: "center", gap: 9, borderRadius: 13, backgroundColor: "rgba(98, 216, 120, 0.09)" },
  feedbackText: { flex: 1, color: "#A9EDB5", fontSize: 12, lineHeight: 17 },
  userRow: { minHeight: 72, padding: 13, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: "rgba(156, 199, 223, 0.11)" },
  avatar: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 21, backgroundColor: "rgba(77, 182, 232, 0.16)" },
  avatarText: { color: Colors.bluePale, fontSize: 12, fontWeight: "900" },
  smallButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: "rgba(255, 107, 107, 0.08)" },
  primaryButton: { minHeight: 50, marginTop: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, borderRadius: 15, backgroundColor: Colors.blueLight },
  primaryButtonText: { color: Colors.navy, fontSize: 14, fontWeight: "900" },
  secondaryButton: { minHeight: 50, marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, borderRadius: 15, backgroundColor: "rgba(255, 107, 107, 0.08)", borderWidth: 1, borderColor: "rgba(255, 107, 107, 0.22)" },
  secondaryButtonText: { color: "#FF9B9B", fontSize: 14, fontWeight: "800" },
  networkHero: { minHeight: 92, marginBottom: 20, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 18, backgroundColor: "rgba(98, 216, 120, 0.08)", borderWidth: 1, borderColor: "rgba(98, 216, 120, 0.2)" },
  networkIcon: { width: 54, height: 54, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: "rgba(98, 216, 120, 0.12)" },
  onlineText: { marginTop: 4, color: "#8BE89C", fontSize: 12, fontWeight: "700" },
  offlineText: { color: Colors.muted },
  ipText: { marginTop: 4, color: Colors.muted, fontSize: 11 },
  deviceRow: { minHeight: 76, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  deviceIcon: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "rgba(77, 182, 232, 0.12)" },
  onlineDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#62D878" },
  buttonDisabled: { opacity: 0.55 },
  centerNote: { marginTop: 11, color: Colors.muted, fontSize: 11, textAlign: "center" },
  networkSettingsButton: { minHeight: 50, marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, borderRadius: 15, backgroundColor: "rgba(77, 182, 232, 0.08)", borderWidth: 1, borderColor: "rgba(77, 182, 232, 0.24)" },
  networkSettingsButtonText: { color: Colors.bluePale, fontSize: 14, fontWeight: "800" },
  dataRow: { minHeight: 76, padding: 14, flexDirection: "row", alignItems: "center", gap: 13 },
  modalRoot: { flex: 1, padding: 20, alignItems: "center", justifyContent: "center", backgroundColor: Colors.overlay },
  userModal: { width: "100%", maxWidth: 460, padding: 20, borderRadius: 22, backgroundColor: Colors.navySoft, borderWidth: 1, borderColor: "rgba(77, 182, 232, 0.32)" },
  modalTitle: { color: Colors.white, fontSize: 21, fontWeight: "900" },
  modalDescription: { marginTop: 5, marginBottom: 18, color: Colors.muted, fontSize: 13, lineHeight: 18 },
  inputLabel: { marginTop: 10, marginBottom: 7, color: Colors.bluePale, fontSize: 11, fontWeight: "800", letterSpacing: 0.8 },
  input: { height: 50, paddingHorizontal: 14, color: Colors.white, fontSize: 15, borderRadius: 14, backgroundColor: Colors.navy, borderWidth: 1, borderColor: "rgba(77, 182, 232, 0.3)" },
  accessOption: { minHeight: 67, marginBottom: 8, padding: 12, flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, backgroundColor: "rgba(6, 26, 47, 0.5)", borderWidth: 1, borderColor: "transparent" },
  accessOptionSelected: { backgroundColor: "rgba(77, 182, 232, 0.1)", borderColor: Colors.blueLight },
  modalActions: { marginTop: 14, flexDirection: "row", gap: 10 },
  cancelButton: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "rgba(156, 199, 223, 0.1)" },
  cancelButtonText: { color: Colors.bluePale, fontSize: 14, fontWeight: "800" },
  confirmButton: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: Colors.blueLight },
  confirmButtonText: { color: Colors.navy, fontSize: 14, fontWeight: "900" },
});
