import { SymbolView } from "expo-symbols";
import { Text } from "react-native";

import { HydroBotIcon } from "@/shared/components/hydro-bot-icon";

type IconName =
  | "alert"
  | "notification"
  | "menu"
  | "home"
  | "history"
  | "sensors"
  | "more"
  | "settings"
  | "info"
  | "chevron"
  | "drop"
  | "waves"
  | "turbidity"
  | "temperature"
  | "calendar"
  | "clock"
  | "check"
  | "trash"
  | "ruler"
  | "users"
  | "wifi"
  | "backup"
  | "database"
  | "shield"
  | "plus"
  | "refresh"
  | "download"
  | "sparkles"
  | "mic"
  | "send"
  | "play"
  | "stop"
  | "close"
  | "hydroBot"
  | "chevronRight";

const icons = {
  alert: { ios: "exclamationmark.triangle.fill", android: "warning", web: "warning" },
  notification: { ios: "bell", android: "notifications", web: "notifications" },
  menu: { ios: "line.3.horizontal", android: "menu", web: "menu" },
  home: { ios: "house.fill", android: "home", web: "home" },
  history: { ios: "clock.arrow.circlepath", android: "history", web: "history" },
  sensors: { ios: "sensor.fill", android: "sensors", web: "sensors" },
  more: { ios: "ellipsis.circle", android: "more_horiz", web: "more_horiz" },
  settings: { ios: "gearshape.fill", android: "settings", web: "settings" },
  info: { ios: "info.circle.fill", android: "info", web: "info" },
  chevron: { ios: "chevron.down", android: "keyboard_arrow_down", web: "keyboard_arrow_down" },
  drop: { ios: "drop.fill", android: "water_drop", web: "water_drop" },
  waves: { ios: "water.waves", android: "waves", web: "waves" },
  turbidity: { ios: "aqi.medium", android: "blur_on", web: "blur_on" },
  temperature: { ios: "thermometer.medium", android: "device_thermostat", web: "device_thermostat" },
  calendar: { ios: "calendar", android: "calendar_today", web: "calendar_today" },
  clock: { ios: "clock.fill", android: "schedule", web: "schedule" },
  check: { ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" },
  trash: { ios: "trash.fill", android: "delete", web: "delete" },
  ruler: { ios: "ruler.fill", android: "straighten", web: "straighten" },
  users: { ios: "person.2.fill", android: "group", web: "group" },
  wifi: { ios: "wifi", android: "wifi", web: "wifi" },
  backup: { ios: "externaldrive.fill", android: "backup", web: "backup" },
  database: { ios: "cylinder.fill", android: "storage", web: "storage" },
  shield: { ios: "shield.fill", android: "security", web: "security" },
  plus: { ios: "plus", android: "add", web: "add" },
  refresh: { ios: "arrow.clockwise", android: "refresh", web: "refresh" },
  download: { ios: "arrow.down.doc.fill", android: "download", web: "download" },
  sparkles: { ios: "sparkles", android: "auto_awesome", web: "auto_awesome" },
  mic: { ios: "mic.fill", android: "mic", web: "mic" },
  send: { ios: "paperplane.fill", android: "send", web: "send" },
  play: { ios: "play.fill", android: "play_arrow", web: "play_arrow" },
  stop: { ios: "stop.fill", android: "stop", web: "stop" },
  close: { ios: "xmark", android: "close", web: "close" },
  chevronRight: { ios: "chevron.right", android: "chevron_right", web: "chevron_right" },
} as const;

type AppIconProps = {
  name: IconName;
  color: string;
  size?: number;
};

export function AppIcon({ name, color, size = 24 }: AppIconProps) {
  if (name === "hydroBot") {
    return <HydroBotIcon color={color} size={size} />;
  }

  return (
    <SymbolView
      name={icons[name]}
      tintColor={color}
      size={size}
      fallback={<Text style={{ color, fontSize: size }}>•</Text>}
    />
  );
}
