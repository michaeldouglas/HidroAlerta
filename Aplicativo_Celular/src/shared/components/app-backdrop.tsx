import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";

export function AppBackdrop() {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.root]}>
      <Svg width="100%" height="100%" viewBox="0 0 400 900" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient id="topGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(330 90) rotate(120) scale(290 250)">
            <Stop stopColor="#167AC0" stopOpacity="0.25" />
            <Stop offset="1" stopColor="#167AC0" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="sideGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(25 520) rotate(20) scale(240 330)">
            <Stop stopColor="#0F6B9D" stopOpacity="0.16" />
            <Stop offset="1" stopColor="#0F6B9D" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="330" cy="90" r="290" fill="url(#topGlow)" />
        <Circle cx="25" cy="520" r="280" fill="url(#sideGlow)" />
        <Path d="M-35 760C55 705 115 805 205 751C295 697 340 770 435 715V900H-35V760Z" fill="#1599D1" fillOpacity="0.045" />
        <Path d="M-20 810C75 755 145 850 235 798C315 752 365 805 430 770" stroke="#4DB6E8" strokeOpacity="0.055" strokeWidth="2" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: "hidden",
  },
});
