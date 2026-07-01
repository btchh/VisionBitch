import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { analyzeImage, PromptKey, PROMPTS } from "../lib/gemini";

type Analysis = {
  objects: string[];
  context: string;
  activities: string;
  recommendations: string | string[];
};

export default function ResultScreen() {
  const { base64Image, promptKey } = useLocalSearchParams<{ base64Image: string; promptKey: PromptKey }>();
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5B3FA3" />
        <Text style={styles.loadingText}>Analyzing image...</Text>
      </View>
    );
  }

  if (error || !analysis) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "No analysis available."}</Text>
      </View>
    );
  }

  const recommendationsText = Array.isArray(analysis.recommendations) ? analysis.recommendations.join("\n\n") : analysis.recommendations;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Objects</Text>
      {analysis.objects.map((obj, i) => (
        <Text key={i} style={styles.listItem}>
          • {obj}
        </Text>
      ))}

      <Text style={styles.sectionTitle}>Context</Text>
      <Text style={styles.bodyText}>{analysis.context}</Text>

      <Text style={styles.sectionTitle}>Activities</Text>
      <Text style={styles.bodyText}>{analysis.activities}</Text>

      <Text style={styles.sectionTitle}>Recommendations</Text>
      <Text style={styles.bodyText}>{recommendationsText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#5A6472" },
  errorText: { color: "#B3261E", textAlign: "center", fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 16, color: "#1F2A44" },
  listItem: { fontSize: 15, marginTop: 4 },
  bodyText: { fontSize: 15, marginTop: 4, color: "#2B2F38" },
});
