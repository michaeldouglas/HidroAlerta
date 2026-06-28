import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import Animated, {
  FadeInDown,
  FadeOut,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { AppIcon } from "@/shared/components/app-icon";
import { Colors } from "@/shared/constants/colors";
import { useRefreshInterval } from "@/shared/contexts/refresh-interval-context";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text?: string;
  audioUri?: string;
  durationSeconds?: number;
  time: string;
};

const suggestions = [
  "A água está própria para consumo?",
  "Existe risco de falta de água?",
  "Qual parâmetro exige atenção?",
  "Explique o valor do pH",
];

const initialMessages: ChatMessage[] = [];

function currentTime() {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
}

function assistantResponse(question: string) {
  const normalized = question.toLocaleLowerCase("pt-BR");

  if (normalized.includes("qualidade") && normalized.includes("boa")) {
    return "A qualidade está classificada como boa porque os indicadores monitorados estão equilibrados: pH 7,1 dentro da faixa ideal, turbidez baixa em 1,3 NTU e temperatura estável em 24,1 °C. O nível de 82% também garante boa disponibilidade, embora não entre no cálculo da qualidade.";
  }
  if (normalized.includes("tendência") || normalized.includes("período")) {
    return "A diferença entre mínimo, média e máximo mostra a amplitude das leituras no período. Não há indicação de mudança crítica, mas oscilações rápidas ou aproximação dos limites merecem atenção. Compare também com períodos anteriores para confirmar se existe uma tendência contínua.";
  }
  if (normalized.includes("alerta") || normalized.includes("possíveis causas")) {
    return "Este alerta indica que uma leitura ou comunicação saiu do comportamento esperado. Verifique primeiro o sensor, a conexão e as condições do reservatório. Se a medição persistir após uma nova leitura, compare o valor com o Histórico e faça uma inspeção da água ou do equipamento.";
  }
  if (normalized.includes("consumo") || normalized.includes("própria")) {
    return "Com base nas leituras atuais:\n\n• pH: 7,1 — ideal\n• Turbidez: 1,3 NTU — boa\n• Temperatura: 24,1 °C — ideal\n• Nível: 82% — bom\n\nOs indicadores monitorados estão dentro das faixas configuradas. A confirmação de potabilidade também depende de análises microbiológicas.";
  }
  if (normalized.includes("falta") || normalized.includes("nível")) {
    return "O nível atual é 82%, dentro da faixa segura de 30% a 90%. Não há risco imediato de falta de água. Recomendo acompanhar a velocidade de consumo no Histórico.";
  }
  if (normalized.includes("crítico") || normalized.includes("atenção") || normalized.includes("parâmetro")) {
    return "Nenhum parâmetro está crítico agora. A turbidez merece acompanhamento contínuo, mas o valor atual de 1,3 NTU está bem abaixo do limite configurado de 5 NTU.";
  }
  if (normalized.includes("ph") || normalized.includes("pH")) {
    return "O pH atual é 7,1, considerado neutro e dentro da faixa recomendada de 6,5 a 8,5. Isso indica equilíbrio entre acidez e alcalinidade.";
  }
  if (normalized.includes("turbidez")) {
    return "A turbidez está em 1,3 NTU. Esse valor indica baixa presença de partículas suspensas e boa transparência da água.";
  }
  if (normalized.includes("temperatura")) {
    return "A temperatura atual é 24,1 °C e permanece estável. Não houve mudança brusca capaz de afetar os outros indicadores.";
  }

  return "Posso analisar nível, pH, turbidez, temperatura, alertas e tendências. Tente perguntar qual indicador está mais próximo do limite ou pedir um resumo da água agora.";
}

function TypingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.25);
  const scale = useSharedValue(0.8);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    // Reanimated shared values are intentionally mutable animation handles.
    // eslint-disable-next-line react-hooks/immutability
    opacity.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 320 }), withTiming(0.25, { duration: 320 })), -1),
    );
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1.15, { duration: 320 }), withTiming(0.8, { duration: 320 })), -1),
    );

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(scale);
    };
  }, [delay, opacity, scale]);

  return <Animated.View style={[styles.typingDot, animatedStyle]} />;
}

function TypingIndicator() {
  return (
    <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOut} style={styles.assistantRow}>
      <View style={styles.avatar}>
        <AppIcon name="hydroBot" color="#8DDCFF" size={22} />
      </View>
      <View style={styles.typingBubble}>
        <TypingDot delay={0} />
        <TypingDot delay={140} />
        <TypingDot delay={280} />
        <Text style={styles.typingText}>HidroIA está analisando</Text>
      </View>
    </Animated.View>
  );
}

function VoiceMessage({ uri, duration }: { uri: string; duration: number }) {
  const [playbackError, setPlaybackError] = useState("");
  const player = useAudioPlayer(uri, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);
  const progress = status.duration > 0 ? Math.min(100, (status.currentTime / status.duration) * 100) : 0;

  async function togglePlayback() {
    setPlaybackError("");
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
        shouldRouteThroughEarpiece: false,
        interruptionMode: "doNotMix",
      });

      if (status.playing) {
        player.pause();
        return;
      }

      if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration - 0.1)) {
        await player.seekTo(0);
      }
      player.play();
    } catch {
      setPlaybackError("Não foi possível reproduzir");
    }
  }

  return (
    <View>
      <Pressable
        style={({ pressed }) => [styles.voiceMessage, pressed && styles.voiceMessagePressed]}
        onPress={togglePlayback}
        accessibilityRole="button"
        accessibilityLabel={status.playing ? "Pausar mensagem de voz" : "Reproduzir mensagem de voz"}
      >
        <View style={styles.voicePlay}>
          <AppIcon name={status.playing ? "stop" : "play"} color={Colors.white} size={18} />
        </View>
        <View style={styles.voiceProgressArea}>
          <View style={styles.waveform}>
            {[10, 18, 13, 22, 16, 25, 12, 20, 15, 23, 11, 18].map((height, index) => (
              <View key={`${height}-${index}`} style={[styles.waveBar, { height }]} />
            ))}
          </View>
          <View style={styles.voiceProgressTrack}>
            <View style={[styles.voiceProgressFill, { width: `${progress}%` }]} />
          </View>
        </View>
        <Text style={styles.voiceDuration}>{status.isBuffering ? "..." : `${duration}s`}</Text>
      </Pressable>
      {playbackError ? <Text style={styles.voiceError}>{playbackError}</Text> : null}
    </View>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <Animated.View
      entering={FadeInDown.duration(330)}
      style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}
    >
      {!isUser ? (
        <View style={styles.avatar}>
          <AppIcon name="hydroBot" color="#8DDCFF" size={22} />
        </View>
      ) : null}
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {message.audioUri ? (
          <VoiceMessage uri={message.audioUri} duration={message.durationSeconds ?? 0} />
        ) : (
          <Text style={styles.messageText}>{message.text}</Text>
        )}
        <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>{message.time}</Text>
      </View>
    </Animated.View>
  );
}

export default function AssistantScreen() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [recordingError, setRecordingError] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const processedPromptRef = useRef("");
  const { prompt } = useLocalSearchParams<{ prompt?: string | string[] }>();
  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    directory: "document",
  });
  const recorderState = useAudioRecorderState(audioRecorder, 200);
  const { intervalSeconds, remainingSeconds } = useRefreshInterval();
  const refreshProgress = `${Math.max(
    0,
    Math.min(100, ((intervalSeconds - remainingSeconds) / intervalSeconds) * 100),
  )}%` as `${number}%`;

  useEffect(() => {
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(timer);
  }, [messages, typing, recorderState.isRecording]);

  useEffect(
    () => () => {
      timersRef.current.forEach(clearTimeout);
    },
    [],
  );

  function queueAssistantResponse(question: string, voice = false) {
    setTyping(true);
    const timer = setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: voice
            ? "Recebi sua mensagem de voz. A gravação foi enviada com sucesso; a transcrição automática será disponibilizada quando o serviço de IA estiver conectado."
            : assistantResponse(question),
          time: currentTime(),
        },
      ]);
      setTyping(false);
    }, 1100 + Math.min(question.length * 12, 900));
    timersRef.current.push(timer);
  }

  function sendText(text = input) {
    const value = text.trim();
    if (!value || typing) return;

    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", text: value, time: currentTime() },
    ]);
    setInput("");
    queueAssistantResponse(value);
  }

  useEffect(() => {
    const contextualPrompt = Array.isArray(prompt) ? prompt[0] : prompt;
    if (!contextualPrompt || typing || processedPromptRef.current === contextualPrompt) return;

    processedPromptRef.current = contextualPrompt;
    const timer = setTimeout(() => sendText(contextualPrompt), 260);
    return () => clearTimeout(timer);
    // sendText is a component-local event function; prompt/typing are the triggers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, typing]);

  async function startRecording() {
    setRecordingError("");
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Microfone bloqueado",
          "Autorize o acesso ao microfone nas configurações do aparelho para enviar mensagens de voz.",
        );
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch {
      setRecordingError("Não foi possível iniciar o microfone.");
    }
  }

  async function finishRecording(send: boolean) {
    const durationSeconds = Math.max(1, Math.round(recorderState.durationMillis / 1000));
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
        shouldRouteThroughEarpiece: false,
      });

      if (send && uri) {
        setMessages((current) => [
          ...current,
          {
            id: Date.now(),
            role: "user",
            audioUri: uri,
            durationSeconds,
            time: currentTime(),
          },
        ]);
        queueAssistantResponse("mensagem de voz", true);
      }
    } catch {
      setRecordingError("Não foi possível finalizar a gravação.");
    }
  }

  const recordingSeconds = Math.floor(recorderState.durationMillis / 1000);

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={6}
    >
      <View style={styles.refreshCard}>
        <View style={styles.refreshIcon}>
          <AppIcon name="refresh" color={Colors.blueLight} size={23} />
        </View>
        <View style={styles.refreshInfo}>
          <Text style={styles.refreshTitle}>Dados em tempo real</Text>
          <Text style={styles.refreshSubtitle}>Atualização automática a cada {intervalSeconds}s</Text>
          <View style={styles.refreshTrack}>
            <View style={[styles.refreshFill, { width: refreshProgress }]} />
          </View>
        </View>
        <View style={styles.countdownBox}>
          <Text style={styles.countdownValue}>{remainingSeconds}s</Text>
          <Text style={styles.countdownLabel}>próxima</Text>
        </View>
      </View>

      <View style={styles.metricsStrip}>
        <View style={styles.metricPill}><Text style={styles.metricLabel}>Nível</Text><Text style={styles.metricValue}>82%</Text></View>
        <View style={styles.metricPill}><Text style={styles.metricLabel}>pH</Text><Text style={styles.metricValue}>7,1</Text></View>
        <View style={styles.metricPill}><Text style={styles.metricLabel}>Turbidez</Text><Text style={styles.metricValue}>1,3</Text></View>
        <View style={styles.metricPill}><Text style={styles.metricLabel}>Temp.</Text><Text style={styles.metricValue}>24,1°</Text></View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 && !typing ? (
          <Animated.View entering={FadeInDown.duration(420)} style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <AppIcon name="hydroBot" color="#9CE4FF" size={48} />
            </View>
            <Text style={styles.emptyTitle}>Como posso ajudar?</Text>
            <Text style={styles.emptyDescription}>
              Pergunte sobre a qualidade, o nível ou as tendências da sua água.
            </Text>
            <View style={styles.emptySuggestions}>
              {suggestions.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  style={({ pressed }) => [styles.suggestion, pressed && styles.suggestionPressed]}
                  onPress={() => sendText(suggestion)}
                >
                  <AppIcon name="sparkles" color={Colors.blueLight} size={13} />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        ) : null}
        {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
        {typing ? <TypingIndicator /> : null}
      </ScrollView>

      {recorderState.isRecording ? (
        <Animated.View entering={FadeInDown.duration(250)} style={styles.recordingBar}>
          <Pressable style={styles.cancelRecording} onPress={() => finishRecording(false)} accessibilityLabel="Cancelar gravação">
            <AppIcon name="close" color={Colors.muted} size={20} />
          </Pressable>
          <View style={styles.recordingPulse} />
          <View style={styles.recordingInfo}>
            <Text style={styles.recordingTitle}>Gravando mensagem</Text>
            <Text style={styles.recordingTime}>0:{String(recordingSeconds).padStart(2, "0")}</Text>
          </View>
          <Pressable style={styles.sendVoiceButton} onPress={() => finishRecording(true)} accessibilityLabel="Enviar áudio">
            <AppIcon name="send" color={Colors.navy} size={21} />
          </Pressable>
        </Animated.View>
      ) : (
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Pergunte sobre a sua água..."
            placeholderTextColor="#6F91A8"
            multiline
            maxLength={500}
            returnKeyType="send"
            blurOnSubmit
            onSubmitEditing={() => sendText()}
          />
          {input.trim() ? (
            <Pressable style={styles.sendButton} onPress={() => sendText()} disabled={typing} accessibilityLabel="Enviar mensagem">
              <AppIcon name="send" color={Colors.navy} size={21} />
            </Pressable>
          ) : (
            <Pressable style={styles.micButton} onPress={startRecording} disabled={typing} accessibilityLabel="Gravar mensagem de voz">
              <AppIcon name="mic" color={Colors.white} size={22} />
            </Pressable>
          )}
        </View>
      )}
      {recordingError ? <Text style={styles.errorText}>{recordingError}</Text> : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8, backgroundColor: "transparent" },
  refreshCard: { minHeight: 66, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 17, backgroundColor: "#092A49", borderWidth: 1, borderColor: "rgba(77, 182, 232, 0.22)" },
  refreshIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "rgba(77, 182, 232, 0.12)" },
  refreshInfo: { flex: 1 },
  refreshTitle: { color: Colors.white, fontSize: 14, fontWeight: "900" },
  refreshSubtitle: { marginTop: 2, color: Colors.muted, fontSize: 9, fontWeight: "600" },
  refreshTrack: { height: 4, marginTop: 7, overflow: "hidden", borderRadius: 2, backgroundColor: "rgba(77, 182, 232, 0.14)" },
  refreshFill: { height: "100%", borderRadius: 2, backgroundColor: Colors.blueLight },
  countdownBox: { width: 52, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "rgba(77, 182, 232, 0.1)" },
  countdownValue: { color: Colors.blueLight, fontSize: 18, fontWeight: "900" },
  countdownLabel: { marginTop: -1, color: Colors.muted, fontSize: 8, fontWeight: "700", textTransform: "uppercase" },
  metricsStrip: { minHeight: 48, marginTop: 7, flexDirection: "row", gap: 6 },
  metricPill: { flex: 1, paddingVertical: 5, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "rgba(77, 182, 232, 0.08)" },
  metricLabel: { color: Colors.muted, fontSize: 9, fontWeight: "700" },
  metricValue: { marginTop: 2, color: Colors.white, fontSize: 14, fontWeight: "900" },
  messages: { flex: 1, marginTop: 6 },
  messagesContent: { flexGrow: 1, paddingVertical: 9, gap: 12 },
  emptyState: { flex: 1, minHeight: 280, paddingHorizontal: 16, alignItems: "center", justifyContent: "center" },
  emptyIcon: { width: 70, height: 70, alignItems: "center", justifyContent: "center", borderRadius: 24, backgroundColor: "rgba(77, 182, 232, 0.11)", borderWidth: 1, borderColor: "rgba(77, 182, 232, 0.2)" },
  emptyTitle: { marginTop: 15, color: Colors.white, fontSize: 21, fontWeight: "900" },
  emptyDescription: { maxWidth: 330, marginTop: 6, color: Colors.muted, fontSize: 12, lineHeight: 18, textAlign: "center" },
  emptySuggestions: { maxWidth: 440, marginTop: 18, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 7 },
  messageRow: { width: "100%", flexDirection: "row", alignItems: "flex-end", gap: 8 },
  userRow: { justifyContent: "flex-end" },
  assistantRow: { justifyContent: "flex-start" },
  avatar: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#0D4069", borderWidth: 1, borderColor: "rgba(77, 182, 232, 0.25)" },
  messageBubble: { maxWidth: "82%", paddingHorizontal: 13, paddingTop: 11, paddingBottom: 7, borderRadius: 18 },
  assistantBubble: { borderBottomLeftRadius: 5, backgroundColor: "#102F4C", borderWidth: 1, borderColor: "rgba(77, 182, 232, 0.12)" },
  userBubble: { borderBottomRightRadius: 5, backgroundColor: "#0969B9" },
  messageText: { color: Colors.white, fontSize: 14, lineHeight: 20 },
  messageTime: { marginTop: 6, color: Colors.muted, fontSize: 9, textAlign: "right" },
  userMessageTime: { color: "rgba(255, 255, 255, 0.7)" },
  typingBubble: { minHeight: 45, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 17, borderBottomLeftRadius: 5, backgroundColor: "#102F4C" },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.blueLight },
  typingText: { marginLeft: 5, color: Colors.muted, fontSize: 10, fontWeight: "600" },
  suggestion: { minHeight: 32, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 16, backgroundColor: "rgba(77, 182, 232, 0.07)", borderWidth: 1, borderColor: "rgba(77, 182, 232, 0.28)" },
  suggestionPressed: { backgroundColor: "rgba(77, 182, 232, 0.18)" },
  suggestionText: { color: Colors.bluePale, fontSize: 10, fontWeight: "700" },
  composer: { minHeight: 54, paddingLeft: 15, paddingRight: 6, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 18, backgroundColor: "#0B2945", borderWidth: 1, borderColor: "rgba(77, 182, 232, 0.17)" },
  input: { flex: 1, maxHeight: 94, paddingVertical: 10, color: Colors.white, fontSize: 14 },
  sendButton: { width: 43, height: 43, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: Colors.blueLight },
  micButton: { width: 43, height: 43, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: "#1268B8" },
  recordingBar: { minHeight: 58, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 18, backgroundColor: "#102F4C", borderWidth: 1, borderColor: "rgba(255, 107, 107, 0.3)" },
  cancelRecording: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  recordingPulse: { width: 11, height: 11, borderRadius: 6, backgroundColor: "#FF6868" },
  recordingInfo: { flex: 1 },
  recordingTitle: { color: Colors.white, fontSize: 13, fontWeight: "800" },
  recordingTime: { marginTop: 2, color: "#FF9A9A", fontSize: 11, fontWeight: "700" },
  sendVoiceButton: { width: 43, height: 43, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: Colors.blueLight },
  voiceMessage: { minWidth: 205, flexDirection: "row", alignItems: "center", gap: 9 },
  voiceMessagePressed: { opacity: 0.7 },
  voicePlay: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "rgba(255, 255, 255, 0.2)" },
  voiceProgressArea: { flex: 1 },
  waveform: { width: "100%", height: 28, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  waveBar: { width: 3, borderRadius: 2, backgroundColor: "rgba(255, 255, 255, 0.72)" },
  voiceProgressTrack: { height: 2, marginTop: 2, overflow: "hidden", borderRadius: 1, backgroundColor: "rgba(255, 255, 255, 0.18)" },
  voiceProgressFill: { height: "100%", borderRadius: 1, backgroundColor: Colors.white },
  voiceDuration: { color: "rgba(255, 255, 255, 0.75)", fontSize: 10, fontWeight: "700" },
  voiceError: { marginTop: 5, color: "#FFD0D0", fontSize: 9, textAlign: "center" },
  errorText: { marginTop: 5, color: "#FF9A9A", fontSize: 10, textAlign: "center" },
});
