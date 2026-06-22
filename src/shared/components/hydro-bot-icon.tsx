import Svg, { Circle, Path, Rect } from "react-native-svg";

type HydroBotIconProps = {
  color: string;
  size?: number;
};

export function HydroBotIcon({ color, size = 24 }: HydroBotIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M24 3C18.7 9.8 10.4 18.6 10.4 28.2 10.4 36 16.5 42.2 24 42.2S37.6 36 37.6 28.2C37.6 18.6 29.3 9.8 24 3Z"
        fill={color}
        fillOpacity={0.22}
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <Path
        d="M17.2 22.2c1.7-1.5 3.8-1.7 5.6-.5M27 20.7c1.8-.8 3.8-.2 4.9 1.1"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <Rect
        x="14.3"
        y="17.7"
        width="19.4"
        height="18.5"
        rx="6.2"
        fill={color}
        fillOpacity={0.1}
        stroke={color}
        strokeWidth={1.5}
      />
      <Circle cx="20.2" cy="26.3" r="2.6" fill={color} />
      <Circle cx="29.2" cy="25.4" r="2.6" fill={color} />
      <Circle cx="21" cy="25.6" r="0.9" fill="#061A2F" />
      <Circle cx="30" cy="24.6" r="0.9" fill="#061A2F" />
      <Path
        d="M19.5 30.8c2.2 3.2 6.8 3.2 9 0"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <Path
        d="M14.2 25.3h-3.1a2.2 2.2 0 0 0-2.2 2.2v2.2a2.2 2.2 0 0 0 2.2 2.2h3.1M33.8 25.3h3.1a2.2 2.2 0 0 1 2.2 2.2v2.2a2.2 2.2 0 0 1-2.2 2.2h-3.1"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Circle cx="11.1" cy="28.6" r="1" fill={color} />
      <Circle cx="36.9" cy="28.6" r="1" fill={color} />
      <Circle cx="39.3" cy="14.3" r="2.1" fill={color} fillOpacity={0.75} />
      <Circle cx="43.1" cy="9.5" r="1.5" fill={color} />
      <Path
        d="M17.1 37.3c2 1.4 4.3 2.1 6.9 2.1"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.55}
      />
      <Path
        d="M15.4 17.9c1.8-3.2 4.2-6.3 6.3-9"
        fill={color}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.55}
      />
    </Svg>
  );
}
