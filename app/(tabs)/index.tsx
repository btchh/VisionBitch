import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CornerFrame from "../../components/CornerFrame";
import { colors, radius, spacing, type } from "../../lib/theme";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIconWrap}>
          <Ionicons name="camera-outline" size={32} color={colors.accent} />
        </View>
        <Text style={type.eyebrow}>CAMERA ACCESS</Text>
        <Text style={[type.title, { marginTop: spacing.sm, textAlign: "center" }]}>VisionAI needs your camera</Text>
        <Text style={[type.body, { textAlign: "center", marginTop: spacing.sm, marginBottom: spacing.lg }]}>{Platform.OS === "ios" ? 'Tap below, then choose "Allow" in the dialog.' : "Tap below to grant the permission."}</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function takePicture() {
    if (!cameraRef.current) return;
    const result = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    if (result) {
      router.push({ pathname: "/preview", params: { photoUri: result.uri } });
    }
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      <View style={[styles.topOverlay, isLandscape ? { top: insets.top + spacing.sm, left: insets.left + spacing.lg, right: undefined, alignItems: "flex-start" } : { top: insets.top + spacing.sm }]} pointerEvents="none">
        <Text style={type.eyebrow}>VISIONAI</Text>
        <Text style={styles.topSubtitle}>Frame your subject</Text>
      </View>

      <View style={[styles.reticleWrap, isLandscape && { right: 120 + insets.right }]} pointerEvents="none">
        <View style={[styles.reticle, isLandscape && styles.reticleLandscape]}>
          <CornerFrame size={28} thickness={3} />
        </View>
      </View>

      <View style={isLandscape ? [styles.sideBar, { paddingRight: insets.right + spacing.lg }] : [styles.bottomBar, { paddingBottom: insets.bottom + spacing.lg }]}>
        <TouchableOpacity style={styles.shutterOuter} onPress={takePicture} activeOpacity={0.8}>
          <View style={styles.shutterInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  camera: { flex: 1 },
  topOverlay: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  topSubtitle: { color: colors.textPrimary, fontSize: 13, marginTop: 4, opacity: 0.85 },
  reticleWrap: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center" },
  reticle: { width: "76%", height: "42%" },
  reticleLandscape: { width: "52%", height: "70%" },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, alignItems: "center" },
  sideBar: { position: "absolute", top: 0, bottom: 0, right: 0, justifyContent: "center", alignItems: "center" },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: { width: 60, height: 60, borderRadius: radius.full, backgroundColor: colors.accent },
  permissionContainer: { flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center", padding: spacing.xl },
  permissionIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  permissionButton: { backgroundColor: colors.accent, paddingVertical: 14, paddingHorizontal: 32, borderRadius: radius.full },
  permissionButtonText: { color: colors.bg, fontWeight: "800", fontSize: 15 },
});
