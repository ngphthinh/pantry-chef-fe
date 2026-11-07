// components/UpdateBanner.tsx
import { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as Updates from "expo-updates";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function UpdateBanner() {
  const { isUpdateAvailable, isUpdatePending, isDownloading, downloadError } =
    Updates.useUpdates();
  const insets = useSafeAreaInsets();
  // Có bản mới đã tải xong -> reload
  useEffect(() => {
    if (isUpdatePending) {
      Updates.reloadAsync();
    }
  }, [isUpdatePending]);
  useEffect(() => {
    if (downloadError) {
      Alert.alert("Lỗi", "Không tải được bản cập nhật. Thử lại sau.");
    }
  }, [downloadError]);

  if (__DEV__ || !isUpdateAvailable) return null;

  return (
    <View
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        bottom: insets.bottom + 12,
        padding: 12,
        borderRadius: 10,
        backgroundColor: "#1e293b",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 999,
        elevation: 10,
      }}>
      <Text style={{ color: "#fff", flex: 1 }}>Có phiên bản mới</Text>
      {isDownloading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <TouchableOpacity
          onPress={() => Updates.fetchUpdateAsync()}
          style={{
            backgroundColor: "#3b82f6",
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 8,
          }}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>Cập nhật</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
