import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { imageToBase64, PromptKey } from "../lib/gemini";
import { colors, radius, spacing, type } from "../lib/theme";

const PERSONAS: { key: PromptKey; label: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "academic", label: "Academic", description: "Professor-style breakdown", icon: "school-outline" },
  { key: "safety", label: "Safety", description: "Hazard & risk check", icon: "shield-checkmark-outline" },
  { key: "inventory", label: "Inventory", description: "Clean asset list", icon: "cube-outline" },
];

export default function PreviewScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = width >= 768;

  async function goAnalyze(promptKey: PromptKey) {
    if (!photoUri) return;
    const base64Image = await imageToBase64(photoUri);
    router.push({ pathname: "/result", params: { base64Image, promptKey } });
  }

  return (
    <View style={[styles.container, isLandscape && styles.containerLandscape]}>
      <Image source={{ uri: photoUri }} style={[styles.preview, isTablet && !isLandscape && styles.previewTablet]} />

      <TouchableOpacity style={[styles.backButton, { top: insets.top + spacing.sm }]} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={[styles.sheet, isLandscape ? [styles.sheetLandscape, { paddingBottom: insets.bottom + spacing.lg, paddingRight: insets.right + spacing.md }] : { paddingBottom: insets.bottom + spacing.lg }]}>
        {!isLandscape && <View style={styles.sheetHandle} />}
        <Text style={type.eyebrow}>CHOOSE AN ANALYSIS LENS</Text>

        <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
          {PERSONAS.map((persona) => (
            <TouchableOpacity key={persona.key} style={styles.personaCard} onPress={() => goAnalyze(persona.key)} activeOpacity={0.7}>
              <View style={styles.personaIconWrap}>
                <Ionicons name={persona.icon} size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.personaLabel}>{persona.label}</Text>
                <Text style={styles.personaDescription}>{persona.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  containerLandscape: { flexDirection: "row" },
  preview: { flex: 1, resizeMode: "contain" },
  previewTablet: { maxWidth: 600, alignSelf: "center" },
  backButton: {
    position: "absolute",
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.25, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  sheetLandscape: {
    width: 320,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    justifyContent: "center",
  },
  sheetHandle: { width: 36, height: 4, borderRadius: radius.full, backgroundColor: colors.border, alignSelf: "center", marginBottom: spacing.md },
  personaCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  personaIconWrap: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  personaLabel: { color: colors.textPrimary, fontSize: 15, fontWeight: "700" },
  personaDescription: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
});
