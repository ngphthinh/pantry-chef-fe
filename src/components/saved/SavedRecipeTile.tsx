import React from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getSavedRecipeImage,
  SavedRecipeImage,
} from "@/components/saved/SavedRecipeImage";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/theme";
import type { SavedRecipeResponse } from "@/types";

interface Props {
  item: SavedRecipeResponse;
  onPress: () => void;
  onToggleFavorite: () => void;
  onRemove?: () => void;
}

export function SavedRecipeTile({ item, onPress, onToggleFavorite, onRemove }: Props) {
  const { colors, isDark } = useTheme();
  const imageUri = getSavedRecipeImage(item);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.touchable}
      onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.imageContainer}>
          <SavedRecipeImage uri={imageUri} className="h-32 w-full" />

          {/* Rating Badge */}
          {item.rating != null && item.rating > 0 ? (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#FBBF24" />
              <AppText style={styles.ratingText}>
                {item.rating.toFixed(1)}
              </AppText>
            </View>
          ) : null}

          {/* Quick Remove Button */}
          {onRemove ? (
            <Pressable
              hitSlop={8}
              onPress={onRemove}
              style={styles.removeBtn}>
              <Ionicons name="trash-outline" size={15} color="#FFFFFF" />
            </Pressable>
          ) : null}
        </View>

        {/* Card Footer */}
        <View style={styles.footer}>
          <AppText
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={2}>
            {item.recipeTitle}
          </AppText>
          <TouchableOpacity
            hitSlop={8}
            onPress={onToggleFavorite}
            style={[
              styles.heartBtn,
              {
                backgroundColor: item.favorite
                  ? isDark
                    ? "rgba(239, 68, 68, 0.18)"
                    : "#FEE2E2"
                  : isDark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.05)",
              },
            ]}>
            <Ionicons
              name={item.favorite ? "heart" : "heart-outline"}
              size={18}
              color={item.favorite ? "#EF4444" : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    maxWidth: "48.5%",
  },
  card: {
    padding: 0,
    overflow: "hidden",
    borderRadius: 20,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
  },
  ratingBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  removeBtn: {
    position: "absolute",
    right: 8,
    top: 8,
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  footer: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  heartBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
