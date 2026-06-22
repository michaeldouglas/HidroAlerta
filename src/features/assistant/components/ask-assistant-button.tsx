import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

import { AppIcon } from "@/shared/components/app-icon";
import { Colors } from "@/shared/constants/colors";

type AskAssistantButtonProps = {
  label: string;
  prompt: string;
  onBeforeNavigate?: () => void;
  compact?: boolean;
};

export function AskAssistantButton({
  label,
  prompt,
  onBeforeNavigate,
  compact = false,
}: AskAssistantButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        pressed && styles.pressed,
      ]}
      onPress={() => {
        onBeforeNavigate?.();
        router.push({ pathname: "/assistente", params: { prompt } });
      }}
      accessibilityRole="button"
      accessibilityLabel={`${label} com a HidroIA`}
    >
      <AppIcon name="hydroBot" color="#9CE4FF" size={compact ? 22 : 27} />
      <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
      <AppIcon name="chevronRight" color={Colors.blueLight} size={compact ? 17 : 19} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    minHeight: 50,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 15,
    backgroundColor: "rgba(77, 182, 232, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(77, 182, 232, 0.34)",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  buttonCompact: {
    minHeight: 40,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  label: {
    flex: 1,
    color: Colors.bluePale,
    fontSize: 13,
    fontWeight: "900",
  },
  labelCompact: {
    fontSize: 11,
  },
});
