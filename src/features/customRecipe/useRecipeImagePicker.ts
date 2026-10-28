import { useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { getErrorMessage } from "@/core/http/apiError";
import type { PickedImage } from "@/types";

/** `message` rỗng nghĩa là người dùng tự huỷ, màn hình không cần báo lỗi. */
export type PickImageResult = { ok: true; image: PickedImage } | { ok: false; message?: string };

/** Xin quyền thư viện ảnh, mở picker và dựng PickedImage cho ảnh món ăn. */
export function useRecipeImagePicker() {
  const pick = useCallback(async (): Promise<PickImageResult> => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return { ok: false, message: "Vui lòng cấp quyền truy cập thư viện ảnh để chọn ảnh món ăn." };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (result.canceled || !result.assets[0]) return { ok: false };

      const asset = result.assets[0];
      return {
        ok: true,
        image: {
          uri: asset.uri,
          fileName: asset.fileName ?? "recipe.jpg",
          mimeType: asset.mimeType ?? "image/jpeg",
        },
      };
    } catch (error) {
      return { ok: false, message: getErrorMessage(error) };
    }
  }, []);

  return { pick };
}
