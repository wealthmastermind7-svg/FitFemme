/**
 * "Watch the Change" — visual before/after progress gallery.
 *
 * Privacy-first by design: photos are copied into the app's
 * documentDirectory and never uploaded. The user's gallery lives only on
 * their device. We persist metadata (uri, date, weight) inside the existing
 * UserProfile so it survives app restarts without a backend.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
// expo-file-system v55 introduced a class-based API; we use the legacy
// import which still ships in the same package and keeps the simpler
// documentDirectory + copy/delete helpers we need here.
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { storage, ProgressEntry, UserProfile } from "@/lib/storage";
import { useLanguage } from "@/lib/i18n";

const KG_PER_LB = 0.45359237;
const PHOTOS_DIR = (FileSystem.documentDirectory ?? "") + "progress-photos/";

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function ensurePhotosDir() {
  if (!FileSystem.documentDirectory) return;
  try {
    const info = await FileSystem.getInfoAsync(PHOTOS_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
    }
  } catch {
    /* directory creation best-effort */
  }
}

/** Copy a picked photo from the OS cache into the app sandbox so we own it. */
async function persistPhoto(srcUri: string): Promise<string> {
  await ensurePhotosDir();
  const ext = srcUri.split(".").pop()?.split("?")[0]?.toLowerCase() ?? "jpg";
  const dest = `${PHOTOS_DIR}${makeId()}.${ext}`;
  try {
    await FileSystem.copyAsync({ from: srcUri, to: dest });
    return dest;
  } catch {
    return srcUri;
  }
}

function formatDate(dateISO: string, locale: string) {
  try {
    return new Date(dateISO).toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateISO.slice(0, 10);
  }
}

function formatWeight(weightKg: number | undefined, units: string | undefined) {
  if (weightKg == null) return "";
  if (units === "Imperial") {
    const lbs = Math.round(weightKg / KG_PER_LB);
    return `${lbs} lbs`;
  }
  return `${weightKg.toFixed(1)} kg`;
}

export default function ProgressScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { t, language } = useLanguage();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [hideWeight, setHideWeight] = useState(false);
  const [leftId, setLeftId] = useState<string | null>(null);
  const [rightId, setRightId] = useState<string | null>(null);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Serializes saves and ensures we never overwrite unrelated profile fields
  // that a different screen may have updated while we were idle.
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  // Load on mount
  useEffect(() => {
    (async () => {
      const p = await storage.getUserProfile();
      setProfile(p);
      const list = p?.progressEntries ?? [];
      setEntries(list);
      // Default compare: oldest on left, newest on right.
      if (list.length >= 1) setLeftId(list[0].id);
      if (list.length >= 2) setRightId(list[list.length - 1].id);
    })();
  }, []);

  /**
   * Merge-safe persistence. We *re-read* the latest profile from disk inside
   * the queued task and only patch `progressEntries`, so concurrent writes
   * from the Profile / Onboarding screens (units, weightDirection, blockers,
   * etc.) can't be clobbered by a stale snapshot from when ProgressScreen
   * first mounted.
   */
  const persistEntries = useCallback((next: ProgressEntry[]) => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      saveQueueRef.current = saveQueueRef.current
        .catch(() => {})
        .then(async () => {
          const latest = await storage.getUserProfile();
          if (!latest) return;
          await storage.saveUserProfile({ ...latest, progressEntries: next });
        });
    }, 250);
  }, []);

  const leftEntry = useMemo(
    () => entries.find((e) => e.id === leftId) ?? null,
    [entries, leftId],
  );
  const rightEntry = useMemo(
    () => entries.find((e) => e.id === rightId) ?? null,
    [entries, rightId],
  );

  const addPhoto = useCallback(async () => {
    try {
      const lib = await ImagePicker.getMediaLibraryPermissionsAsync();
      let granted = lib.granted;
      if (!granted) {
        const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
        granted = req.granted;
      }
      if (!granted) {
        Alert.alert(t("progress.permTitle"), t("progress.permBody"));
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        allowsEditing: false,
      });
      if (res.canceled || !res.assets?.[0]) return;
      const persisted = await persistPhoto(res.assets[0].uri);
      const newEntry: ProgressEntry = {
        id: makeId(),
        uri: persisted,
        dateISO: new Date().toISOString(),
        weightKg: profile?.weight
          ? profile.units === "Imperial"
            ? profile.weight * KG_PER_LB
            : profile.weight
          : undefined,
      };
      const next = [...entries, newEntry];
      setEntries(next);
      // First photo becomes the left ("Before"); each new photo becomes the
      // right ("After") so the most recent is always front-and-center.
      if (!leftId) setLeftId(newEntry.id);
      else setRightId(newEntry.id);
      persistEntries(next);
      if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
    } catch {
      Alert.alert(t("progress.errTitle"), t("progress.errBody"));
    }
  }, [entries, leftId, persistEntries, t]);

  const removeEntry = useCallback(
    (id: string) => {
      Alert.alert(t("progress.delTitle"), t("progress.delBody"), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("progress.delete"),
          style: "destructive",
          onPress: async () => {
            // Use the functional setter so we always operate on the freshest
            // entry list — the user may have added another photo while the
            // confirmation dialog was open, and we don't want to drop it.
            let removedUri: string | undefined;
            setEntries((current) => {
              const removed = current.find((e) => e.id === id);
              removedUri = removed?.uri;
              const next = current.filter((e) => e.id !== id);
              setLeftId((prev) => (prev === id ? next[0]?.id ?? null : prev));
              setRightId((prev) =>
                prev === id ? next[next.length - 1]?.id ?? null : prev,
              );
              persistEntries(next);
              return next;
            });
            // Best-effort delete from disk.
            if (removedUri && removedUri.startsWith(PHOTOS_DIR)) {
              try {
                await FileSystem.deleteAsync(removedUri, { idempotent: true });
              } catch {
                /* ignore */
              }
            }
          },
        },
      ]);
    },
    [persistEntries, t],
  );

  const onTapPhotoStrip = useCallback(
    (id: string) => {
      // Toggle which slot the tap fills: prefer empty right slot, else left,
      // else replace whichever side it isn't already on.
      if (!rightId) return setRightId(id);
      if (!leftId) return setLeftId(id);
      if (id === leftId) return setRightId(id);
      setLeftId(id);
    },
    [leftId, rightId],
  );

  const shareLatest = useCallback(async () => {
    const target = rightEntry ?? leftEntry ?? entries[entries.length - 1];
    if (!target) return;
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) return;
      await Sharing.shareAsync(target.uri, {
        dialogTitle: t("progress.shareTitle"),
      });
    } catch {
      /* user cancelled or unsupported */
    }
  }, [entries, leftEntry, rightEntry, t]);

  // Right header "+" button
  useEffect(() => {
    navigation.setOptions?.({
      headerRight: () => (
        <Pressable
          onPress={addPhoto}
          hitSlop={12}
          style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
        >
          <Feather name="plus" size={20} color={Colors.primary} />
        </Pressable>
      ),
    });
  }, [navigation, addPhoto]);

  const PhotoSlot = ({
    entry,
    isPrimary,
    label,
  }: {
    entry: ProgressEntry | null;
    isPrimary: boolean;
    label: string;
  }) => (
    <Pressable
      onPress={!entry ? addPhoto : undefined}
      style={[
        styles.slot,
        isPrimary && styles.slotPrimary,
      ]}
    >
      {entry ? (
        <Image source={{ uri: entry.uri }} style={styles.slotImage} resizeMode="cover" />
      ) : (
        <View style={styles.slotEmpty}>
          <Feather name="image" size={28} color={Colors.white40} />
        </View>
      )}
      <View style={styles.slotOverlay}>
        {!hideWeight && entry?.weightKg ? (
          <ThemedText style={styles.slotWeight}>
            {formatWeight(entry.weightKg, profile?.units)}
          </ThemedText>
        ) : null}
        <ThemedText style={styles.slotDate}>
          {entry ? formatDate(entry.dateISO, language) : label}
        </ThemedText>
      </View>
    </Pressable>
  );

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing["3xl"],
        },
      ]}
    >
      <View style={styles.compareRow}>
        <PhotoSlot entry={leftEntry} isPrimary={false} label={t("progress.before")} />
        <PhotoSlot entry={rightEntry} isPrimary label={t("progress.after")} />
      </View>

      <View style={styles.toggleRow}>
        <ThemedText style={styles.toggleLabel}>{t("progress.hideWeight")}</ThemedText>
        <Switch
          value={hideWeight}
          onValueChange={setHideWeight}
          trackColor={{ false: Colors.white10, true: Colors.primary }}
          thumbColor={Colors.white}
        />
      </View>

      <ThemedText style={styles.sectionLabel}>{t("progress.allPhotos")}</ThemedText>
      <View style={styles.gallery}>
        {entries.map((e) => {
          const isLeft = e.id === leftId;
          const isRight = e.id === rightId;
          return (
            <Pressable
              key={e.id}
              onPress={() => onTapPhotoStrip(e.id)}
              onLongPress={() => removeEntry(e.id)}
              delayLongPress={350}
              style={[
                styles.thumb,
                (isLeft || isRight) && styles.thumbActive,
              ]}
            >
              <Image source={{ uri: e.uri }} style={styles.thumbImage} resizeMode="cover" />
              {isLeft ? (
                <View style={styles.thumbBadge}>
                  <ThemedText style={styles.thumbBadgeText}>
                    {t("progress.before").toUpperCase()}
                  </ThemedText>
                </View>
              ) : null}
              {isRight ? (
                <View style={[styles.thumbBadge, styles.thumbBadgeAfter]}>
                  <ThemedText style={styles.thumbBadgeText}>
                    {t("progress.after").toUpperCase()}
                  </ThemedText>
                </View>
              ) : null}
            </Pressable>
          );
        })}
        <Pressable onPress={addPhoto} style={[styles.thumb, styles.thumbAdd]}>
          <Feather name="plus" size={26} color={Colors.primary} />
        </Pressable>
      </View>

      {entries.length > 0 ? (
        <ThemedText style={styles.helpText}>{t("progress.longPressHint")}</ThemedText>
      ) : (
        <ThemedText style={styles.helpText}>{t("progress.emptyHint")}</ThemedText>
      )}

      {entries.length > 0 ? (
        <Pressable onPress={shareLatest} style={styles.shareBtn}>
          <Feather name="share" size={18} color={Colors.white} />
          <ThemedText style={styles.shareTxt}>{t("progress.share")}</ThemedText>
        </Pressable>
      ) : null}

      <ThemedText style={styles.privacy}>{t("progress.privacy")}</ThemedText>
    </ScrollView>
  );
}

const SLOT_RADIUS = BorderRadius.lg;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundDark },
  content: { paddingHorizontal: Spacing.lg },
  headerBtn: { padding: Spacing.xs },
  compareRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  slot: {
    flex: 1,
    aspectRatio: 0.78,
    borderRadius: SLOT_RADIUS,
    backgroundColor: Colors.backgroundLight,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "transparent",
    justifyContent: "flex-end",
  },
  slotPrimary: { borderColor: Colors.primary },
  slotImage: { ...StyleSheet.absoluteFillObject },
  slotEmpty: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  slotOverlay: {
    padding: Spacing.md,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  slotWeight: { color: Colors.white, fontSize: 22, fontWeight: "800" },
  slotDate: { color: Colors.white80, fontSize: 13, marginTop: 2 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.backgroundLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  toggleLabel: { color: Colors.white, fontSize: 16, fontWeight: "600" },
  sectionLabel: {
    color: Colors.white60,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  thumb: {
    width: 72,
    height: 88,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundLight,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  thumbActive: { borderColor: Colors.primary },
  thumbImage: { ...StyleSheet.absoluteFillObject },
  thumbAdd: {
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
    borderColor: Colors.primary,
  },
  thumbBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  thumbBadgeAfter: { backgroundColor: Colors.primary },
  thumbBadgeText: { fontSize: 9, fontWeight: "800", color: Colors.white, letterSpacing: 0.5 },
  helpText: {
    color: Colors.white40,
    fontSize: 12,
    textAlign: "center",
    marginTop: Spacing.lg,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 999,
    marginTop: Spacing.xl,
  },
  shareTxt: { color: Colors.white, fontSize: 16, fontWeight: "700" },
  privacy: {
    color: Colors.white40,
    fontSize: 11,
    textAlign: "center",
    marginTop: Spacing.lg,
    lineHeight: 16,
  },
});
