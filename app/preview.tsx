import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { imageToBase64, PromptKey } from "../lib/gemini";

export default function PreviewScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const router = useRouter();

  async function goAnalyze(promptKey: PromptKey) {
    if (!photoUri) return;
    const base64Image = await imageToBase64(photoUri);
    router.push({ pathname: "/result", params: { base64Image, promptKey } });
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.preview} />

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.retakeButton} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Retake</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.personaRow}>
        <TouchableOpacity style={styles.personaButton} onPress={() => goAnalyze("academic")}>
          <Text style={styles.buttonText}>Academic</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.personaButton} onPress={() => goAnalyze("safety")}>
          <Text style={styles.buttonText}>Safety</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.personaButton} onPress={() => goAnalyze("inventory")}>
          <Text style={styles.buttonText}>Inventory</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  preview: { flex: 1, resizeMode: "contain" },
  actionRow: { flexDirection: "row", justifyContent: "center", padding: 10 },
  retakeButton: { backgroundColor: "#5A6472", padding: 14, borderRadius: 8 },
  personaRow: { flexDirection: "row", justifyContent: "space-around", paddingBottom: 30 },
  personaButton: { backgroundColor: "#5B3FA3", padding: 12, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
