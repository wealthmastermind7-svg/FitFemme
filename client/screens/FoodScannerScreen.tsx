import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

interface NutritionResult {
  dish: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  healthScore: number;
  description: string;
  ingredients: string[];
}

export default function FoodScannerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<NutritionResult | null>(null);

  const pickImage = async (fromCamera: boolean) => {
    setResult(null);

    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Camera access needed", "Please allow camera access in settings.");
        return;
      }
      const picked = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        base64: true,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!picked.canceled && picked.assets[0]) {
        setImageUri(picked.assets[0].uri);
        setImageBase64(picked.assets[0].base64 ?? null);
      }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Gallery access needed", "Please allow photo library access in settings.");
        return;
      }
      const picked = await ImagePicker.launchImageLibraryAsync({
        quality: 0.7,
        base64: true,
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (!picked.canceled && picked.assets[0]) {
        setImageUri(picked.assets[0].uri);
        setImageBase64(picked.assets[0].base64 ?? null);
      }
    }
  };

  const analyze = async () => {
    if (!imageBase64) {
      Alert.alert("No image", "Please take or select a photo first.");
      return;
    }
    setAnalyzing(true);
    setResult(null);
    try {
      const url = new URL("/api/ai/analyze-food", getApiUrl());
      const resp = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error ?? `Server error ${resp.status}`);
      }
      const data = await resp.json();
      setResult(data);
    } catch (e: any) {
      Alert.alert("Analysis failed", e.message ?? "Something went wrong. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImageUri(null);
    setImageBase64(null);
    setResult(null);
  };

  const healthColor = (score: number) => {
    if (score >= 8) return "#4caf50";
    if (score >= 5) return "#f0c93e";
    return "#e53935";
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
          <Feather name="x" size={22} color={Colors.white} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Food Scanner</ThemedText>
        {imageUri ? (
          <Pressable onPress={reset} hitSlop={12}>
            <ThemedText style={styles.resetText}>Reset</ThemedText>
          </Pressable>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Image area */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={["rgba(212,17,115,0.15)", "rgba(34,16,25,0.4)"]}
              style={styles.imagePlaceholder}
            >
              <Feather name="camera" size={48} color={Colors.primary} />
              <ThemedText style={styles.placeholderText}>Take or upload a photo of your meal</ThemedText>
            </LinearGradient>
          )}
        </View>

        {/* Pick buttons */}
        {!result && (
          <View style={styles.pickRow}>
            <Pressable style={styles.pickBtn} onPress={() => pickImage(true)}>
              <Feather name="camera" size={18} color={Colors.primary} />
              <ThemedText style={styles.pickBtnText}>Camera</ThemedText>
            </Pressable>
            <Pressable style={styles.pickBtn} onPress={() => pickImage(false)}>
              <Feather name="image" size={18} color={Colors.primary} />
              <ThemedText style={styles.pickBtnText}>Gallery</ThemedText>
            </Pressable>
          </View>
        )}

        {/* Analyze button */}
        {imageUri && !result && (
          <Pressable
            style={[styles.analyzeBtn, analyzing && styles.analyzeBtnDisabled]}
            onPress={analyze}
            disabled={analyzing}
          >
            {analyzing ? (
              <View style={styles.analyzingRow}>
                <ActivityIndicator color="#fff" size="small" />
                <ThemedText style={styles.analyzeBtnText}>Analyzing...</ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.analyzeBtnText}>Analyze Nutrition</ThemedText>
            )}
          </Pressable>
        )}

        {/* Results */}
        {result && (
          <View style={styles.results}>
            {/* Dish name + health score */}
            <View style={styles.resultHeader}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.dishName}>{result.dish}</ThemedText>
                <ThemedText style={styles.dishDesc}>{result.description}</ThemedText>
              </View>
              <View style={[styles.healthBadge, { backgroundColor: healthColor(result.healthScore) + "22", borderColor: healthColor(result.healthScore) }]}>
                <ThemedText style={[styles.healthScore, { color: healthColor(result.healthScore) }]}>
                  {result.healthScore}/10
                </ThemedText>
                <ThemedText style={[styles.healthLabel, { color: healthColor(result.healthScore) }]}>health</ThemedText>
              </View>
            </View>

            {/* Calories */}
            <View style={styles.caloriesCard}>
              <LinearGradient
                colors={[Colors.primary + "33", Colors.primary + "11"]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Feather name="zap" size={20} color={Colors.primary} />
              <ThemedText style={styles.caloriesNum}>{result.calories}</ThemedText>
              <ThemedText style={styles.caloriesLabel}>kcal</ThemedText>
            </View>

            {/* Macros row */}
            <View style={styles.macroRow}>
              <MacroCard label="Protein" value={result.protein} unit="g" color="#4fc3f7" icon="activity" />
              <MacroCard label="Carbs" value={result.carbs} unit="g" color="#f0c93e" icon="layers" />
              <MacroCard label="Fat" value={result.fat} unit="g" color="#ff8a65" icon="droplet" />
              <MacroCard label="Fiber" value={result.fiber} unit="g" color="#81c784" icon="feather" />
            </View>

            {/* Ingredients */}
            {result.ingredients.length > 0 && (
              <View style={styles.ingredientsSection}>
                <ThemedText style={styles.sectionTitle}>Detected ingredients</ThemedText>
                <View style={styles.ingredientTags}>
                  {result.ingredients.map((ing, i) => (
                    <View key={i} style={styles.tag}>
                      <ThemedText style={styles.tagText}>{ing}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Scan another */}
            <Pressable style={styles.scanAnotherBtn} onPress={reset}>
              <Feather name="refresh-cw" size={16} color={Colors.primary} />
              <ThemedText style={styles.scanAnotherText}>Scan another meal</ThemedText>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function MacroCard({
  label,
  value,
  unit,
  color,
  icon,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
  icon: string;
}) {
  return (
    <View style={[styles.macroCard, { borderColor: color + "40" }]}>
      <Feather name={icon as any} size={14} color={color} />
      <ThemedText style={[styles.macroValue, { color }]}>{value}{unit}</ThemedText>
      <ThemedText style={styles.macroLabel}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundDark },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backBtn: { width: 44, height: 44, justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.white },
  resetText: { fontSize: 14, color: Colors.primary, fontWeight: "600" },
  content: { paddingHorizontal: Spacing.lg, gap: 16 },
  imageContainer: { borderRadius: BorderRadius.xl, overflow: "hidden", height: 260 },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary + "40",
    borderRadius: BorderRadius.xl,
    borderStyle: "dashed",
  },
  placeholderText: {
    color: Colors.white60,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  pickRow: { flexDirection: "row", gap: 12 },
  pickBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary + "60",
    backgroundColor: Colors.primary + "10",
  },
  pickBtnText: { color: Colors.primary, fontWeight: "600", fontSize: 15 },
  analyzeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
  },
  analyzeBtnDisabled: { opacity: 0.7 },
  analyzingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  analyzeBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  results: { gap: 16 },
  resultHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  dishName: { fontSize: 22, fontWeight: "700", color: Colors.white, marginBottom: 4 },
  dishDesc: { fontSize: 13, color: Colors.white60, lineHeight: 18 },
  healthBadge: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 56,
  },
  healthScore: { fontSize: 15, fontWeight: "800" },
  healthLabel: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", marginTop: 1 },
  caloriesCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 18,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
    overflow: "hidden",
  },
  caloriesNum: { fontSize: 32, fontWeight: "800", color: Colors.white },
  caloriesLabel: { fontSize: 14, color: Colors.white60, fontWeight: "500", marginTop: 4 },
  macroRow: { flexDirection: "row", gap: 8 },
  macroCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  macroValue: { fontSize: 16, fontWeight: "700" },
  macroLabel: { fontSize: 10, color: Colors.white60, textTransform: "uppercase", fontWeight: "600" },
  ingredientsSection: { gap: 10 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: Colors.white60, textTransform: "uppercase", letterSpacing: 0.8 },
  ingredientTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: { fontSize: 13, color: Colors.white, fontWeight: "500" },
  scanAnotherBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: Colors.primary + "60",
  },
  scanAnotherText: { color: Colors.primary, fontWeight: "600", fontSize: 15 },
});
