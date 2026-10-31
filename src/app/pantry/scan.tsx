import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter, type Href } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import { Screen } from "@/components/ui/Screen";
import { getErrorMessage } from "@/core/http/apiError";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useAiRecognition } from "@/features/ai/useAiRecognition";
import type { PickedImage, RecognizedIngredientResponse } from "@/types";

/** Gợi ý chọn sẵn các nguyên liệu AI khá chắc chắn. */
const AUTO_SELECT_CONFIDENCE = 0.5;

function confidenceTone(c: number): "success" | "warn" | "danger" {
  if (c >= 0.8) return "success";
  if (c >= AUTO_SELECT_CONFIDENCE) return "warn";
  return "danger";
}

function SourceCard({
  icon,
  title,
  hint,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  hint: string;
  onPress: () => void;
}) {
  const { brand } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="active:opacity-80"
    >
      <Card className="flex-row items-center gap-4 p-4">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-brandSoft dark:bg-successBg-dark">
          <Ionicons name={icon} size={24} color={brand} />
        </View>
        <View className="flex-1">
          <AppText variant="heading">{title}</AppText>
          <AppText variant="caption">{hint}</AppText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={brand} />
      </Card>
    </Pressable>
  );
}
function LoadingOverlay({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="absolute inset-0 items-center justify-center rounded-3xl bg-black/50 px-6">
      <ActivityIndicator size="large" color="#FFFFFF" />
      <AppText className="mt-3 text-center font-bold text-white">
        {title}
      </AppText>
      {subtitle ? (
        <AppText className="mt-1 text-center text-white">{subtitle}</AppText>
      ) : null}
    </View>
  );
}

export default function ScanIngredientsScreen() {
  const router = useRouter();
  const { palette, brand } = useAppTheme();
  const { ingredients, recognize, clear } = useAiRecognition();
  const { height: windowHeight } = useWindowDimensions();
  const previewHeight = Math.min(windowHeight * 0.45, 420);

  const [image, setImage] = useState<PickedImage | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false); // đang lấy ảnh từ máy
  const [imageLoading, setImageLoading] = useState(false); // đang render ảnh

  const busy = scanning || picking;

  const pick = async (source: "camera" | "library") => {
    if (busy) return;
    setError(null);
    setPicking(true);
    try {
      if (source === "camera") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setError("Cần cấp quyền camera để chụp ảnh nguyên liệu.");
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ["images"],
        quality: 0.7,
      };
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled) return;

      const asset = result.assets[0];
      setImageLoading(true);
      setImage({
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });
      setScanned(false);
      setSelected(new Set());
      clear();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setPicking(false);
    }
  };
  const onScan = async () => {
    if (!image) return;
    setScanning(true);
    setError(null);
    try {
      const result = await recognize(image);
      setSelected(
        new Set(
          result.flatMap((r, i) =>
            r.confidence >= AUTO_SELECT_CONFIDENCE ? [i] : [],
          ),
        ),
      );
      setScanned(true);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setScanning(false);
    }
  };

  const toggle = (index: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(index)) next.add(index);
      return next;
    });

  const searchRecipes = () => {
    const names = ingredients
      .filter((_, i) => selected.has(i))
      .map((r) => r.nameEn);
    router.push(
      `/search?ingredients=${encodeURIComponent(names.join(","))}` as Href,
    );
  };

  /** Chuyển các món đã chọn sang màn kiểm tra để gán nguyên liệu thật rồi lưu vào tủ. */
  const addToPantry = () => {
    const picked = ingredients
      .filter((_, i) => selected.has(i))
      .map((r) => ({
        name: r.name,
        nameEn: r.nameEn,
        confidence: r.confidence,
        quantityHint: r.quantityHint ?? null,
      }));
    router.push({
      pathname: "/pantry/scan-review",
      params: { items: JSON.stringify(picked) },
    } as Href);
  };

  return (
    <Screen>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityLabel="Quay lại"
        >
          <Ionicons name="chevron-back" size={26} color={palette.ink} />
        </Pressable>
        <AppText variant="heading" className="flex-1">
          Quét ảnh bằng AI
        </AppText>
      </View>

      <AppText variant="caption">
        Chụp hoặc chọn ảnh nguyên liệu, AI sẽ nhận diện giúp bạn. Chụp đủ sáng
        và rõ để kết quả tốt hơn.
      </AppText>
      {!image ? (
        picking ? (
          <Card className="items-center justify-center gap-3 p-8">
            <ActivityIndicator size="large" color={brand} />
            <AppText variant="caption">Đang tải ảnh...</AppText>
          </Card>
        ) : (
          <View className="gap-3">
            <SourceCard
              icon="camera-outline"
              title="Chụp ảnh"
              hint="Chụp trực tiếp nguyên liệu"
              onPress={() => pick("camera")}
            />
            <SourceCard
              icon="images-outline"
              title="Chọn từ thư viện"
              hint="Dùng ảnh có sẵn trong máy"
              onPress={() => pick("library")}
            />
          </View>
        )
      ) : (
        <View className="gap-3">
          <View
            className="w-full items-center justify-center overflow-hidden rounded-3xl bg-soft dark:bg-soft-dark"
            style={{ height: previewHeight }}
          >
            <Image
              source={{ uri: image.uri }}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setError("Không thể hiển thị ảnh này, vui lòng chọn ảnh khác.");
              }}
            />

            {scanning ? (
              <LoadingOverlay
                title="AI đang nhận diện nguyên liệu..."
                subtitle="Vui lòng chờ trong giây lát"
              />
            ) : picking || imageLoading ? (
              <LoadingOverlay title="Đang tải ảnh..." />
            ) : null}
          </View>

          <Button
            title={
              scanning
                ? "Đang nhận diện..."
                : scanned
                  ? "Nhận diện lại"
                  : "Nhận diện nguyên liệu"
            }
            loading={scanning}
            disabled={busy || imageLoading}
            onPress={onScan}
          />
          <View className="flex-row gap-3">
            <Button
              title="Chụp lại"
              variant="outline"
              className="flex-1"
              disabled={busy}
              onPress={() => pick("camera")}
            />
            <Button
              title="Chọn ảnh khác"
              variant="outline"
              className="flex-1"
              disabled={busy}
              onPress={() => pick("library")}
            />
          </View>
        </View>
      )}

      {error ? <AppText variant="error">{error}</AppText> : null}

      {scanned && (
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <AppText variant="heading">Nguyên liệu nhận diện được</AppText>
            <Badge label={`${ingredients.length} món`} tone="success" />
          </View>

          {ingredients.length === 0 ? (
            <Card className="p-4">
              <AppText variant="caption">
                Không nhận diện được nguyên liệu nào. Hãy thử ảnh rõ hơn, đủ
                sáng và chụp gần hơn.
              </AppText>
            </Card>
          ) : (
            <>
              <Card className="overflow-hidden">
                {ingredients.map((r: RecognizedIngredientResponse, i) => {
                  const checked = selected.has(i);
                  return (
                    <Pressable
                      key={`${r.nameEn}-${i}`}
                      onPress={() => toggle(i)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked }}
                      className={cn(
                        "flex-row items-center gap-3 px-4 py-3 active:opacity-70",
                        i > 0 && "border-t border-line dark:border-line-dark",
                      )}
                    >
                      <Ionicons
                        name={checked ? "checkbox" : "square-outline"}
                        size={24}
                        color={checked ? brand : palette.muted}
                      />
                      <View className="flex-1">
                        <AppText className="font-bold">{r.name}</AppText>
                        <AppText variant="caption">
                          {[r.quantityHint, r.nameEn]
                            .filter(Boolean)
                            .join(" · ")}
                        </AppText>
                      </View>
                      <Badge
                        label={`${Math.round(r.confidence * 100)}%`}
                        tone={confidenceTone(r.confidence)}
                      />
                    </Pressable>
                  );
                })}
              </Card>

              <View className="flex-row items-start gap-2">
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={palette.muted}
                />
                <AppText variant="caption" className="flex-1">
                  Kết quả do AI nhận diện, có thể chưa chính xác. Hãy bỏ chọn
                  món sai trước khi tiếp tục.
                </AppText>
              </View>

              <Button
                title={`Thêm vào tủ (${selected.size})`}
                disabled={selected.size === 0}
                onPress={addToPantry}
              />
              <Button
                title={`Tìm công thức (${selected.size})`}
                variant="outline"
                disabled={selected.size === 0}
                onPress={searchRecipes}
              />
            </>
          )}
        </View>
      )}
    </Screen>
  );
}
