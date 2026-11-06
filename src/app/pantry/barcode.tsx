import { useCallback, useEffect, useRef, useState } from "react";
import { Linking, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
  type Href,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageScreen } from "@/components/ui/PageScreen";
import { TextField } from "@/components/ui/TextField";
import { barcodePicker } from "@/features/ingredient/barcodePicker";
import {
  toPantryNewParams,
  toPickedIngredient,
} from "@/features/ingredient/ingredientPicker";
import { useBarcodeLookup } from "@/features/ingredient/useBarcodeLookup";
import {
  BARCODE_PATTERN,
  ingredientValidators,
} from "@/features/ingredient/validation";
import type { IngredientResponse } from "@/types";

export default function BarcodeScreen() {
  const router = useRouter();
  /** `pick=1`: chỉ lấy mã vạch trả về form gọi (không tra nguyên liệu, không mở pantry/new). */
  const { pick } = useLocalSearchParams<{ pick?: string }>();
  const pickMode = pick === "1";

  const { colors, isDark } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const scanner = useBarcodeLookup();
  const [focused, setFocused] = useState(true);
  const [pickError, setPickError] = useState<string | null>(null);
  const handled = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      handled.current = false;
      return () => setFocused(false);
    }, []),
  );

  // Thoát mà chưa quét thì huỷ yêu cầu đang chờ.
  useEffect(
    () => () => {
      if (pickMode) barcodePicker.cancel();
    },
    [pickMode],
  );

  const openPantryNew = (ingredient: IngredientResponse) =>
    router.replace({
      pathname: "/pantry/new",
      params: toPantryNewParams(toPickedIngredient(ingredient)),
    });

  const finishPick = (code: string) => {
    barcodePicker.resolve(code);
    router.back();
  };

  const handleScanned = async (raw: string) => {
    if (!focused) return;

    if (pickMode) {
      const code = raw.trim();
      if (handled.current || !BARCODE_PATTERN.test(code)) return;
      handled.current = true;
      finishPick(code);
      return;
    }

    const ingredient = await scanner.lookup(raw);
    if (ingredient) openPantryNew(ingredient);
  };

  const handleManual = async () => {
    if (pickMode) {
      const invalid = ingredientValidators.barcode(scanner.manualCode);
      if (invalid) {
        setPickError(invalid);
        return;
      }
      finishPick(scanner.manualCode.trim());
      return;
    }

    const ingredient = await scanner.submitManual();
    if (ingredient) openPantryNew(ingredient);
  };

  const cameraGranted = permission?.granted === true;
  const showResult =
    !pickMode && scanner.error !== null && scanner.lastCode !== null;

  return (
    <PageScreen title="Quét mã vạch">
      <AppText variant="caption">
        {pickMode
          ? "Hướng camera vào mã vạch trên bao bì, mã sẽ được điền vào form nguyên liệu."
          : "Hướng camera vào mã vạch trên bao bì. Nếu nguyên liệu có trong danh mục, mình sẽ điền sẵn vào form thêm món."}
      </AppText>

      {/* Camera */}
      {!permission ? null : cameraGranted ? (
        <View className="relative h-72 overflow-hidden rounded-3xl border border-line bg-black dark:border-line-dark">
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "itf14"],
            }}
            onBarcodeScanned={
              focused && !showResult
                ? ({ data }) => void handleScanned(data)
                : undefined
            }
          />
          {/* Viewfinder overlay */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: "center",
              justifyContent: "center",
            }}>
            <View
              style={{
                width: 240,
                height: 140,
                borderWidth: 2,
                borderColor: colors.primary,
                borderRadius: 16,
                backgroundColor: "rgba(0, 0, 0, 0.08)",
              }}
            />
            <AppText
              style={{
                color: "#FFFFFF",
                fontSize: 12,
                fontWeight: "600",
                marginTop: 10,
                textShadowColor: "rgba(0, 0, 0, 0.8)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}>
              Căn mã vạch vào giữa khung
            </AppText>
          </View>
        </View>
      ) : (
        <Card className="items-center p-6 gap-3.5 shadow-sm">
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: isDark ? "rgba(244, 114, 182, 0.15)" : "#FDF2F8",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 4,
              borderWidth: 1,
              borderColor: isDark ? "rgba(244, 114, 182, 0.3)" : "#FBCFE8",
            }}>
            <Ionicons name="camera" size={30} color={isDark ? "#F472B6" : "#DB2777"} />
          </View>
          <AppText variant="heading" className="text-center text-lg">
            Cần quyền dùng camera
          </AppText>
          <AppText variant="caption" className="text-center px-2">
            Cho phép ứng dụng sử dụng camera để tự động quét mã vạch, hoặc bạn có thể nhập mã bằng tay ở bên dưới.
          </AppText>
          <View className="w-full pt-1">
            {permission.canAskAgain ? (
              <Button
                title="Cho phép dùng camera"
                variant="soft-pink"
                iconLeft={
                  <Ionicons
                    name="camera-outline"
                    size={19}
                    color={isDark ? "#F472B6" : "#BE185D"}
                  />
                }
                onPress={() => void requestPermission()}
              />
            ) : (
              <Button
                title="Mở cài đặt thiết bị"
                variant="outline"
                iconLeft={<Ionicons name="settings-outline" size={19} color={colors.textPrimary} />}
                onPress={() => void Linking.openSettings()}
              />
            )}
          </View>
        </Card>
      )}
      {showResult && (
        <Card className="gap-3 p-4">
          <AppText variant="error">{scanner.error}</AppText>
          <AppText variant="caption">Mã vừa quét: {scanner.lastCode}</AppText>
          <View className="flex-row gap-3">
            <Button
              title="Quét lại"
              variant="outline"
              className="flex-1"
              onPress={scanner.reset}
            />
            <Button
              title="Tìm theo tên"
              className="flex-1"
              onPress={() =>
                router.replace("/pantry/select-ingredient" as Href)
              }
            />
          </View>
        </Card>
      )}
      <Card className="gap-3.5 p-5 shadow-sm">
        <View className="flex-row items-center gap-2">
          <Ionicons name="barcode-outline" size={20} color={colors.primary} />
          <AppText variant="heading" className="text-base">
            Nhập mã vạch thủ công
          </AppText>
        </View>

        <TextField
          placeholder="8–14 chữ số, ví dụ 8934000000011"
          keyboardType="number-pad"
          maxLength={14}
          value={scanner.manualCode}
          onChangeText={(text) => {
            scanner.setManualCode(text.replace(/\D/g, ""));
            setPickError(null);
            if (scanner.error) scanner.reset();
          }}
          error={pickError}
          onSubmitEditing={() => void handleManual()}
          returnKeyType={pickMode ? "done" : "search"}
        />

        <Button
          title={pickMode ? "Dùng mã này" : "Tra mã vạch"}
          iconLeft={
            <Ionicons
              name={pickMode ? "checkmark-circle-outline" : "search-outline"}
              size={18}
              color="#FFFFFF"
            />
          }
          loading={!pickMode && scanner.isLooking}
          disabled={!scanner.manualCode || scanner.manualCode.length < 8}
          onPress={() => void handleManual()}
        />
      </Card>
    </PageScreen>
  );
}
