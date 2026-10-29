import { useCallback, useState } from "react";
import { Linking, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect, useRouter, type Href } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageScreen } from "@/components/ui/PageScreen";
import { TextField } from "@/components/ui/TextField";
import { toPantryNewParams, toPickedIngredient } from "@/features/ingredient/ingredientPicker";
import { useBarcodeLookup } from "@/features/ingredient/useBarcodeLookup";
import type { IngredientResponse } from "@/types";

export default function BarcodeScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const scanner = useBarcodeLookup();
  const [focused, setFocused] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  const openPantryNew = (ingredient: IngredientResponse) =>
    router.replace({
      pathname: "/pantry/new",
      params: toPantryNewParams(toPickedIngredient(ingredient)),
    });

  const handleScanned = async (code: string) => {
    if (!focused) return;
    const ingredient = await scanner.lookup(code);
    if (ingredient) openPantryNew(ingredient);
  };

  const handleManual = async () => {
    const ingredient = await scanner.submitManual();
    if (ingredient) openPantryNew(ingredient);
  };

  const cameraGranted = permission?.granted === true;
  const showResult = scanner.error !== null && scanner.lastCode !== null;

  return (
    <PageScreen title="Quét mã vạch">
      <AppText variant="caption">
        Hướng camera vào mã vạch trên bao bì. Nếu nguyên liệu có trong danh mục, mình sẽ điền sẵn vào form thêm món.
      </AppText>

      {/* Camera */}
      {!permission ? null : cameraGranted ? (
        <View className="h-72 overflow-hidden rounded-3xl border border-line bg-black dark:border-line-dark">
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "itf14"] }}
            onBarcodeScanned={focused && !showResult ? ({ data }) => void handleScanned(data) : undefined}
          />
        </View>
      ) : (
        <Card className="items-center gap-3 p-5">
          <AppText className="text-center font-bold">Cần quyền dùng camera để quét mã vạch</AppText>
          <AppText variant="caption" className="text-center">
            Bạn vẫn có thể nhập mã vạch bằng tay ở bên dưới.
          </AppText>
          {permission.canAskAgain ? (
            <Button title="Cho phép dùng camera" onPress={() => void requestPermission()} />
          ) : (
            <Button title="Mở cài đặt thiết bị" variant="outline" onPress={() => void Linking.openSettings()} />
          )}
        </Card>
      )}
      {showResult && (
        <Card className="gap-3 p-4">
          <AppText variant="error">{scanner.error}</AppText>
          <AppText variant="caption">Mã vừa quét: {scanner.lastCode}</AppText>
          <View className="flex-row gap-3">
            <Button title="Quét lại" variant="outline" className="flex-1" onPress={scanner.reset} />
            <Button
              title="Tìm theo tên"
              className="flex-1"
              onPress={() => router.replace("/pantry/select-ingredient" as Href)}
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
            if (scanner.error) scanner.reset();
          }}
          onSubmitEditing={() => void handleManual()}
          returnKeyType="search"
        />
        <Button title="Tra mã vạch" loading={scanner.isLooking} onPress={() => void handleManual()} />
      </View>
    </PageScreen>
  );
}
