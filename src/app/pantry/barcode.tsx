import { useCallback, useEffect, useRef, useState } from "react";
import { Linking, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
  type Href,
} from "expo-router";

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
        <View className="h-72 overflow-hidden rounded-3xl border border-line bg-black dark:border-line-dark">
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
        </View>
      ) : (
        <Card className="items-center gap-3 p-5">
          <AppText className="text-center font-bold">
            Cần quyền dùng camera để quét mã vạch
          </AppText>
          <AppText variant="caption" className="text-center">
            Bạn vẫn có thể nhập mã vạch bằng tay ở bên dưới.
          </AppText>
          {permission.canAskAgain ? (
            <Button
              title="Cho phép dùng camera"
              onPress={() => void requestPermission()}
            />
          ) : (
            <Button
              title="Mở cài đặt thiết bị"
              variant="outline"
              onPress={() => void Linking.openSettings()}
            />
          )}
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
      <View className="gap-3">
        <TextField
          label="Hoặc nhập mã vạch"
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
          loading={!pickMode && scanner.isLooking}
          onPress={() => void handleManual()}
        />
      </View>
    </PageScreen>
  );
}
