import React, {useEffect, useState} from "react";
import {Image, Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";

import {cn} from "@/components/ui/cn";
import {useAppTheme} from "@/core/theme/useAppTheme";
import type {StorageLocation} from "@/types";

export interface PantryItemThumbnailProps {
  photoUri?: string | null;
  location?: StorageLocation | null;
  /** Tên nguyên liệu, dùng để hiện chữ cái đầu khi không có ảnh (tùy chọn). */
  name?: string;
  /** true: hiện chữ cái đầu của `name` khi không có ảnh. false: hiện icon. */
  showInitialWhenEmpty?: boolean;
  /** true: không render gì cả khi không có ảnh. */
  hideWhenEmpty?: boolean;
  className?: string;
  iconSize?: number;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  fallbackIconColor?: string;
  fallbackBgClassName?: string;
}

/**
 * Hiển thị ảnh nguyên liệu nếu có (và tải thành công).
 * Nếu photoUri là null/rỗng hoặc ảnh bị lỗi, hiển thị fallback:
 *  - hideWhenEmpty        -> không hiển thị gì
 *  - showInitialWhenEmpty -> chữ cái đầu của tên
 *  - mặc định             -> icon theo vị trí bảo quản
 */
export function PantryItemThumbnail({
  photoUri,
  location,
  name,
  showInitialWhenEmpty = false,
  hideWhenEmpty = false,
  className = "h-12 w-12",
  iconSize = 22,
  fallbackIcon,
  fallbackIconColor,
  fallbackBgClassName,
}: PantryItemThumbnailProps) {
  const {brand, palette} = useAppTheme();
  const [failed, setFailed] = useState(false);

  // Reset trạng thái lỗi khi đổi ảnh (ví dụ vừa chụp/upload ảnh mới)
  useEffect(() => {
    setFailed(false);
  }, [photoUri]);

  // Coi chuỗi rỗng / toàn khoảng trắng như null
  const cleanUri = photoUri?.trim() ? photoUri.trim() : null;
  const hasImage = !!cleanUri && !failed;

  // 1) Có ảnh -> hiển thị ảnh
  if (hasImage) {
    return (
      <View
        className={cn(
          "overflow-hidden rounded-2xl bg-soft shadow-inner dark:bg-soft-dark",
          className,
        )}
      >
        <Image
          source={{uri: cleanUri}}
          className='h-full w-full'
          resizeMode='cover'
          onError={() => setFailed(true)}
        />
      </View>
    );
  }

  // 2) Không có ảnh + muốn ẩn hẳn
  if (hideWhenEmpty) return null;

  // 3) Không có ảnh -> fallback về icon ảnh placeholder (giống hình mẫu ảnh bạn gửi)
  const iconName = fallbackIcon ?? "image-outline";
  const iconColor = fallbackIconColor ?? palette.muted;
  const initial = name?.trim().charAt(0).toUpperCase();

  return (
    <View
      className={cn(
        "items-center justify-center rounded-2xl bg-soft shadow-inner dark:bg-soft-dark",
        fallbackBgClassName,
        className,
      )}
    >
      {showInitialWhenEmpty && initial ? (
        <Text
          style={{
            color: iconColor,
            fontSize: iconSize,
            fontWeight: "600",
          }}
        >
          {initial}
        </Text>
      ) : (
        <Ionicons name={iconName} size={iconSize} color={iconColor} />
      )}
    </View>
  );
}
