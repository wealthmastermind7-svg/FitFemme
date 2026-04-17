import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

const { width: SCREEN_W } = Dimensions.get("window");
const CIRCLE_SIZE = Math.min(SCREEN_W - 48, 340);
const BG = "#0d0a14";
const ACCENT = Colors.primary; // #d41173 — used in result panels only
const CORAL = Colors.primary; // brand pink used as accent on the scanner hero
const PILL_BG = "rgba(20,14,28,0.82)";

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

const FOOD_PLACEHOLDER = require("../../assets/images/workouts/workout3.png");

export default function FoodScannerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [activeTab, setActiveTab] = useState<"macros" | "stats">("macros");

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
        Alert.alert("Gallery access needed", "Please allow photo library access.");
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
    if (!imageBase64) return;
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
      setActiveTab("macros");
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

  const healthColor = (score: number) =>
    score >= 8 ? "#4caf50" : score >= 5 ? "#f0c93e" : "#e53935";

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={14} style={styles.headerBtn}>
          <Feather name="x" size={20} color="rgba(255,255,255,0.7)" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Food Scanner</ThemedText>
        {imageUri ? (
          <Pressable onPress={reset} hitSlop={14} style={styles.headerBtn}>
            <Feather name="refresh-cw" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>
        ) : (
          <View style={styles.headerBtn} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Central circle ──────────────────────────────────── */}
        <View style={styles.circleWrapper}>
          {/* Glow ring */}
          <View style={styles.glowRing} />

          {/* Circle image */}
          <View style={styles.circle}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <Image source={FOOD_PLACEHOLDER} style={StyleSheet.absoluteFill} resizeMode="cover" />
            )}

            {/* Dark gradient overlay on circle */}
            <LinearGradient
              colors={["rgba(13,10,20,0.45)", "rgba(13,10,20,0.15)", "rgba(13,10,20,0.55)"]}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
            />

            {/* Center label (only when no result) */}
            {!result && (
              <View style={styles.circleCenter}>
                <ThemedText style={styles.circleTitleSmall}>Analyse Food</ThemedText>
                <ThemedText style={styles.circleTitleBig}>Plate</ThemedText>
              </View>
            )}

            {/* Result dish name overlay */}
            {result && (
              <View style={styles.circleCenter}>
                <ThemedText style={styles.resultDishOnCircle} numberOfLines={2}>
                  {result.dish}
                </ThemedText>
                <View style={[styles.healthDot, { backgroundColor: healthColor(result.healthScore) }]}>
                  <ThemedText style={styles.healthDotText}>{result.healthScore}/10</ThemedText>
                </View>
              </View>
            )}
          </View>

          {/* ── Floating pill — STATS (top-right) ── */}
          <Pressable
            style={[styles.floatingPill, styles.pillTopRight, activeTab === "stats" && result && styles.pillActive]}
            onPress={() => result && setActiveTab("stats")}
          >
            {Platform.OS === "ios" ? (
              <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            ) : null}
            <View style={styles.pillContent}>
              <Feather name="activity" size={18} color={activeTab === "stats" && result ? ACCENT : CORAL} />
              <ThemedText style={[styles.pillLabel, activeTab === "stats" && result && { color: ACCENT }]}>
                STATS
              </ThemedText>
            </View>
          </Pressable>

          {/* ── Floating pill — MACROS (bottom-left) ── */}
          <Pressable
            style={[styles.floatingPill, styles.pillBottomLeft, activeTab === "macros" && result && styles.pillActive]}
            onPress={() => result && setActiveTab("macros")}
          >
            {Platform.OS === "ios" ? (
              <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            ) : null}
            <View style={styles.pillContent}>
              <Feather name="pie-chart" size={18} color={activeTab === "macros" && result ? ACCENT : CORAL} />
              <ThemedText style={[styles.pillLabel, activeTab === "macros" && result && { color: ACCENT }]}>
                MACROS
              </ThemedText>
            </View>
          </Pressable>

          {/* ── SCAN ME / Analyze button (bottom center) ── */}
          {!result && (
            <View style={styles.scanBtnWrapper}>
              {analyzing ? (
                <View style={styles.scanBtn}>
                  <ActivityIndicator color="#fff" size="small" />
                  <ThemedText style={styles.scanBtnText}>Analysing...</ThemedText>
                </View>
              ) : imageUri ? (
                <Pressable style={styles.scanBtn} onPress={analyze}>
                  <Feather name="zap" size={18} color="#fff" />
                  <ThemedText style={styles.scanBtnText}>ANALYSE NOW</ThemedText>
                </Pressable>
              ) : (
                <Pressable style={styles.scanBtn} onPress={() => pickImage(true)}>
                  <Feather name="camera" size={18} color="#fff" />
                  <ThemedText style={styles.scanBtnText}>SCAN ME</ThemedText>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* ── Gallery pick option ── */}
        {!imageUri && !result && (
          <Pressable style={styles.galleryBtn} onPress={() => pickImage(false)}>
            <Feather name="image" size={16} color="rgba(255,255,255,0.45)" />
            <ThemedText style={styles.galleryBtnText}>Choose from gallery instead</ThemedText>
          </Pressable>
        )}

        {/* ── Results ──────────────────────────────────────── */}
        {result && (
          <>
            {/* Calories card — always visible */}
            <View style={styles.caloriesCard}>
              <LinearGradient
                colors={[ACCENT + "28", ACCENT + "08"]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Feather name="zap" size={22} color={ACCENT} />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.caloriesNum}>{result.calories} kcal</ThemedText>
                <ThemedText style={styles.caloriesDesc}>{result.description}</ThemedText>
              </View>
            </View>

            {/* MACROS tab */}
            {activeTab === "macros" && (
              <View style={styles.tabPanel}>
                <ThemedText style={styles.panelTitle}>Macronutrients</ThemedText>
                <View style={styles.macroGrid}>
                  <MacroTile label="Protein" value={result.protein} unit="g" color="#4fc3f7" icon="activity" />
                  <MacroTile label="Carbs" value={result.carbs} unit="g" color="#f0c93e" icon="layers" />
                  <MacroTile label="Fat" value={result.fat} unit="g" color="#ff8a65" icon="droplet" />
                  <MacroTile label="Fiber" value={result.fiber} unit="g" color="#81c784" icon="feather" />
                </View>
                {result.ingredients.length > 0 && (
                  <View style={styles.ingredientsSection}>
                    <ThemedText style={styles.panelSubtitle}>Detected Ingredients</ThemedText>
                    <View style={styles.tagRow}>
                      {result.ingredients.map((ing, i) => (
                        <View key={i} style={styles.tag}>
                          <ThemedText style={styles.tagText}>{ing}</ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* STATS tab */}
            {activeTab === "stats" && (
              <View style={styles.tabPanel}>
                <ThemedText style={styles.panelTitle}>Nutrition Score</ThemedText>
                <StatRow label="Health Score" value={`${result.healthScore} / 10`} color={healthColor(result.healthScore)} fill={result.healthScore / 10} />
                <StatRow label="Protein Ratio" value={`${Math.round((result.protein * 4 / result.calories) * 100)}%`} color="#4fc3f7" fill={(result.protein * 4) / result.calories} />
                <StatRow label="Carb Ratio" value={`${Math.round((result.carbs * 4 / result.calories) * 100)}%`} color="#f0c93e" fill={(result.carbs * 4) / result.calories} />
                <StatRow label="Fat Ratio" value={`${Math.round((result.fat * 9 / result.calories) * 100)}%`} color="#ff8a65" fill={(result.fat * 9) / result.calories} />
              </View>
            )}

            {/* Scan another */}
            <Pressable style={styles.scanAnotherBtn} onPress={reset}>
              <Feather name="camera" size={15} color={ACCENT} />
              <ThemedText style={styles.scanAnotherText}>Scan another meal</ThemedText>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function MacroTile({ label, value, unit, color, icon }: { label: string; value: number; unit: string; color: string; icon: string }) {
  return (
    <View style={[styles.macroTile, { borderColor: color + "35" }]}>
      <Feather name={icon as any} size={16} color={color} />
      <ThemedText style={[styles.macroValue, { color }]}>{value}{unit}</ThemedText>
      <ThemedText style={styles.macroLabel}>{label}</ThemedText>
    </View>
  );
}

function StatRow({ label, value, color, fill }: { label: string; value: string; color: string; fill: number }) {
  const safeFill = Math.min(Math.max(isNaN(fill) ? 0 : fill, 0), 1);
  return (
    <View style={styles.statRow}>
      <View style={styles.statRowTop}>
        <ThemedText style={styles.statLabel}>{label}</ThemedText>
        <ThemedText style={[styles.statValue, { color }]}>{value}</ThemedText>
      </View>
      <View style={styles.statBarBg}>
        <View style={[styles.statBarFill, { width: `${safeFill * 100}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

const PILL_SIZE = 72;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "600", color: "rgba(255,255,255,0.7)", letterSpacing: 0.5 },

  content: { paddingHorizontal: 24, alignItems: "center", paddingTop: 8 },

  // ── Circle ──
  circleWrapper: {
    width: CIRCLE_SIZE + 40,
    height: CIRCLE_SIZE + 60,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 8,
  },
  glowRing: {
    position: "absolute",
    width: CIRCLE_SIZE + 18,
    height: CIRCLE_SIZE + 18,
    borderRadius: (CIRCLE_SIZE + 18) / 2,
    borderWidth: 4,
    borderColor: CORAL + "70",
    shadowColor: CORAL,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 14,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: CORAL + "55",
    justifyContent: "center",
    alignItems: "center",
  },
  circleCenter: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 40,
  },
  circleTitleSmall: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  circleTitleBig: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  resultDishOnCircle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
    marginBottom: 8,
  },
  healthDot: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
  },
  healthDotText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  // ── Floating pills ──
  floatingPill: {
    position: "absolute",
    width: PILL_SIZE,
    height: PILL_SIZE,
    borderRadius: PILL_SIZE / 2,
    backgroundColor: PILL_BG,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  pillTopRight: {
    top: 16,
    right: 0,
  },
  pillBottomLeft: {
    bottom: 20,
    left: 0,
  },
  pillActive: {
    borderColor: ACCENT + "55",
    backgroundColor: ACCENT + "18",
  },
  pillContent: {
    alignItems: "center",
    gap: 4,
  },
  pillLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: CORAL,
    letterSpacing: 0.8,
  },

  // ── SCAN ME button ──
  scanBtnWrapper: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
  },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: CORAL,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 99,
    shadowColor: CORAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 10,
  },
  scanBtnText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 1 },

  galleryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 10,
  },
  galleryBtnText: { color: "rgba(255,255,255,0.4)", fontSize: 13 },

  // ── Results ──
  caloriesCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ACCENT + "25",
    overflow: "hidden",
    marginBottom: 14,
  },
  caloriesNum: { fontSize: 24, fontWeight: "800", color: "#fff", marginBottom: 2 },
  caloriesDesc: { fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 16 },

  tabPanel: {
    width: "100%",
    gap: 14,
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  panelSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 4,
  },
  macroGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  macroTile: {
    flex: 1,
    minWidth: "45%",
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  macroValue: { fontSize: 18, fontWeight: "800" },
  macroLabel: { fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", fontWeight: "600" },

  ingredientsSection: { gap: 8 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: { fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: "500" },

  statRow: { gap: 8, marginBottom: 4 },
  statRowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statLabel: { fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: "500" },
  statValue: { fontSize: 13, fontWeight: "700" },
  statBarBg: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 99,
    overflow: "hidden",
  },
  statBarFill: { height: "100%", borderRadius: 99 },

  scanAnotherBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: ACCENT + "50",
    width: "100%",
    marginBottom: 8,
  },
  scanAnotherText: { color: ACCENT, fontWeight: "600", fontSize: 14 },
});
