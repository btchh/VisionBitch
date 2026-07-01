import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { analyzeImage, PromptKey, PROMPTS } from "../lib/gemini";
import { colors, radius, spacing, type } from "../lib/theme";

type Analysis = {
  objects: string[];
  context: string;
  activities: string;
  recommendations: string | string[];
};

const PERSONA_META: Record<PromptKey, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  academic: { label: "Academic", icon: "school-outline" },
  safety: { label: "Safety", icon: "shield-checkmark-outline" },
  inventory: { label: "Inventory", icon: "cube-outline" },
};

export default function ResultScreen() {
  const { base64Image, promptKey } = useLocalSearchParams<{ base64Image: string; promptKey: PromptKey }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isWide = width >= 700;
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runAnalysis();
  }, []);

  function cleanJsonText(text: string): string {
    return text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
  }

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const prompt = PROMPTS[promptKey] ?? PROMPTS.academic;
      const result = await analyzeImage(base64Image, prompt);
      const textPart = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textPart) throw new Error("Empty response from Gemini");
      const cleaned = cleanJsonText(textPart);
      setAnalysis(JSON.parse(cleaned));
    } catch (err) {
      console.log("ANALYZE ERROR:", err);
      setError("Could not analyze this image. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const meta = PERSONA_META[promptKey] ?? PERSONA_META.academic;

  function handleRetake() {
    router.dismissTo("/");
  }

  const BackButton = () => (
    <TouchableOpacity style={[styles.backButton, { top: insets.top + spacing.sm }]} onPress={handleRetake}>
      <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <BackButton />
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[type.eyebrow, { marginTop: spacing.md }]}>ANALYZING IMAGE</Text>
        <Text style={styles.loadingSubtext}>Running the {meta.label.toLowerCase()} lens...</Text>
      </View>
    );
  }

  if (error || !analysis) {
    return (
      <View style={styles.centered}>
        <BackButton />
        <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
        <Text style={[type.title, { marginTop: spacing.md, textAlign: "center" }]}>Analysis failed</Text>
        <Text style={[type.body, { textAlign: "center", marginTop: spacing.sm, marginBottom: spacing.lg }]}>{error ?? "No analysis available."}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={runAnalysis}>
          <Ionicons name="refresh" size={16} color={colors.bg} />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const recommendationsText = Array.isArray(analysis.recommendations) ? analysis.recommendations.join("\n\n") : analysis.recommendations;

  const cards = [
    {
      key: "objects",
      icon: "layers-outline" as const,
      title: "Objects",
      body: (
        <View style={styles.chipRow}>
          {analysis.objects.map((obj, i) => (
            <View key={i} style={styles.chip}>
              <Text style={styles.chipText}>{obj}</Text>
            </View>
          ))}
        </View>
      ),
    },
    { key: "context", icon: "image-outline" as const, title: "Context", body: <Text style={styles.cardBody}>{analysis.context}</Text> },
    { key: "activities", icon: "walk-outline" as const, title: "Activities", body: <Text style={styles.cardBody}>{analysis.activities}</Text> },
    { key: "recommendations", icon: "bulb-outline" as const, title: "Recommendations", body: <Text style={styles.cardBody}>{recommendationsText}</Text> },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackButton />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top + spacing.xl + 40, paddingBottom: insets.bottom + spacing.xl }}>
        <View style={styles.header}>
          <View style={styles.personaBadge}>
            <Ionicons name={meta.icon} size={14} color={colors.accent} />
            <Text style={styles.personaBadgeText}>{meta.label.toUpperCase()}</Text>
          </View>
          <Text style={type.eyebrow}>ANALYSIS COMPLETE</Text>
        </View>

        <View style={isLandscape || isWide ? styles.cardGrid : undefined}>
          {cards.map((c) => (
            <View key={c.key} style={[styles.card, (isLandscape || isWide) && styles.cardHalf]}>
              <View style={styles.cardHeader}>
                <Ionicons name={c.icon} size={16} color={colors.accent} />
                <Text style={styles.cardTitle}>{c.title}</Text>
              </View>
              {c.body}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },
  centered: { flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center", padding: spacing.xl },
  loadingSubtext: { color: colors.textSecondary, fontSize: 13, marginTop: spacing.sm },
  retryButton: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: colors.accent, paddingVertical: 12, paddingHorizontal: 24, borderRadius: radius.full },
  retryButtonText: { color: colors.bg, fontWeight: "800", fontSize: 14 },
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
  },
  header: { marginBottom: spacing.lg, gap: spacing.sm },
  personaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
  },
  personaBadgeText: { color: colors.accent, fontSize: 11, fontWeight: "800", letterSpacing: 1, fontFamily: "monospace" },
  cardGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md },
  cardHalf: { width: "48%" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.sm },
  cardTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "700" },
  cardBody: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.full },
  chipText: { color: colors.textPrimary, fontSize: 13 },
});
