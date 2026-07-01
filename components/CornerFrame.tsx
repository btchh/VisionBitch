import { StyleSheet, View } from "react-native";
import { colors } from "../lib/theme";

export default function CornerFrame({ size = 26, thickness = 3 }: { size?: number; thickness?: number }) {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={[styles.corner, styles.topLeft, { width: size, height: size, borderTopWidth: thickness, borderLeftWidth: thickness }]} />
      <View style={[styles.corner, styles.topRight, { width: size, height: size, borderTopWidth: thickness, borderRightWidth: thickness }]} />
      <View style={[styles.corner, styles.bottomLeft, { width: size, height: size, borderBottomWidth: thickness, borderLeftWidth: thickness }]} />
      <View style={[styles.corner, styles.bottomRight, { width: size, height: size, borderBottomWidth: thickness, borderRightWidth: thickness }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject },
  corner: { position: "absolute", borderColor: colors.accent },
  topLeft: { top: 0, left: 0, borderTopLeftRadius: 6 },
  topRight: { top: 0, right: 0, borderTopRightRadius: 6 },
  bottomLeft: { bottom: 0, left: 0, borderBottomLeftRadius: 6 },
  bottomRight: { bottom: 0, right: 0, borderBottomRightRadius: 6 },
});
