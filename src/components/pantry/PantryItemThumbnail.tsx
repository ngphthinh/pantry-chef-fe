import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import type { StorageLocation } from "@/types";

export interface PantryItemThumbnailProps {
  photoUri?: string | null;
  location?: StorageLocation | null;
  name?: string;
  showInitialWhenEmpty?: boolean;
  hideWhenEmpty?: boolean;
  className?: string;
  iconSize?: number;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  fallbackIconColor?: string;
  fallbackBgClassName?: string;
}

/**
 * Xác định icon và màu sắc sống động tương ứng với nguyên liệu và vị trí bảo quản
 */
function getSmartVisual(name?: string, location?: StorageLocation | null) {
  const lower = (name || "").toLowerCase();

  if (lower.includes("thịt") || lower.includes("bò") || lower.includes("heo") || lower.includes("gà")) {
    return {
      icon: "restaurant" as const,
      bgDark: "rgba(239, 68, 68, 0.18)",
      bgLight: "#FEE2E2",
      colorDark: "#F87171",
      colorLight: "#DC2626",
    };
  }

  if (lower.includes("trứng")) {
    return {
      icon: "ellipse" as const,
      bgDark: "rgba(245, 158, 11, 0.18)",
      bgLight: "#FEF3C7",
      colorDark: "#FBBF24",
      colorLight: "#D97706",
    };
  }

  if (lower.includes("cá") || lower.includes("tôm") || lower.includes("hải sản")) {
    return {
      icon: "water" as const,
      bgDark: "rgba(14, 165, 233, 0.18)",
      bgLight: "#E0F2FE",
      colorDark: "#38BDF8",
      colorLight: "#0284C7",
    };
  }

  if (lower.includes("rau") || lower.includes("cải") || lower.includes("hành") || lower.includes("tỏi") || lower.includes("ớt") || lower.includes("cà chua")) {
    return {
      icon: "leaf" as const,
      bgDark: "rgba(16, 185, 129, 0.18)",
      bgLight: "#DCFCE7",
      colorDark: "#34D399",
      colorLight: "#16A34A",
    };
  }

  // Fallback theo Location
  if (location === "FREEZER") {
    return {
      icon: "snow" as const,
      bgDark: "rgba(56, 189, 248, 0.18)",
      bgLight: "#E0F2FE",
      colorDark: "#38BDF8",
      colorLight: "#0284C7",
    };
  }

  if (location === "PANTRY_SHELF") {
    return {
      icon: "cube" as const,
      bgDark: "rgba(245, 158, 11, 0.18)",
      bgLight: "#FEF3C7",
      colorDark: "#FBBF24",
      colorLight: "#D97706",
    };
  }

  // Mặc định (Tủ mát / khác)
  return {
    icon: "fast-food" as const,
    bgDark: "rgba(52, 211, 153, 0.18)",
    bgLight: "#DCFCE7",
    colorDark: "#34D399",
    colorLight: "#059669",
  };
}

/**
 * Hiển thị ảnh nguyên liệu nếu có.
 * Khi chưa có ảnh -> fallback về icon thông minh theo nhóm thực phẩm & vị trí bảo quản
 * với phong cách Frosted Bento Badge hiện đại, sinh động, bắt mắt.
 */
export function PantryItemThumbnail({
  photoUri,
  location,
  name,
  showInitialWhenEmpty = false,
  hideWhenEmpty = false,
  iconSize = 22,
  fallbackIcon,
  fallbackIconColor,
}: PantryItemThumbnailProps) {
  const { isDark, radius } = useTheme();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [photoUri]);

  const cleanUri = photoUri?.trim() ? photoUri.trim() : null;
  const hasImage = !!cleanUri && !failed;

  // 1) Có ảnh -> hiển thị ảnh với bo góc mượt mà
  if (hasImage) {
    return (
      <View
        style={[
          styles.container,
          {
            borderRadius: radius["2xl"],
            backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6",
          },
        ]}>
        <Image
          source={{ uri: cleanUri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      </View>
    );
  }

  if (hideWhenEmpty) return null;

  // 2) Không có ảnh -> Hiển thị Bento Avatar sống động theo danh mục thực phẩm
  const visual = getSmartVisual(name, location);
  const bgColor = isDark ? visual.bgDark : visual.bgLight;
  const fgColor = fallbackIconColor || (isDark ? visual.colorDark : visual.colorLight);
  const icon = fallbackIcon || visual.icon;
  const initial = name?.trim().charAt(0).toUpperCase();

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius: radius["2xl"],
          backgroundColor: bgColor,
          borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
          borderWidth: 1,
        },
      ]}>
      {showInitialWhenEmpty && initial ? (
        <Text
          style={{
            color: fgColor,
            fontSize: iconSize,
            fontWeight: "800",
          }}>
          {initial}
        </Text>
      ) : (
        <Ionicons name={icon} size={iconSize} color={fgColor} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
