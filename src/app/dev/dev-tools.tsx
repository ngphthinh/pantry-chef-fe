import { ActivityIndicator, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageScreen } from "@/components/ui/PageScreen";
import { brand } from "@/core/theme/colors";
import { confirmAction, notify } from "@/core/ui/dialogs";
import { useDevTools } from "@/features/sync/useDevTools";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-3">
      <AppText variant="caption" className="shrink-0">
        {label}
      </AppText>
      <AppText className="flex-1 text-right font-semibold" selectable>
        {value}
      </AppText>
    </View>
  );
}

export default function DevToolsScreen() {
  const dev = useDevTools();

  if (!dev.isDevBuild) {
    return (
      <PageScreen title="Công cụ phát triển">
        <EmptyState icon="construct-outline" title="Chỉ dùng khi phát triển" />
      </PageScreen>
    );
  }

  const handleClearCache = async () => {
    const ok = await confirmAction({
      title: "Xoá cache",
      message: "Xoá dữ liệu đã lưu để xem offline (công thức đã lưu, bộ sưu tập, enum...).",
      confirmText: "Xoá",
      destructive: true,
    });
    if (!ok) return;
    const result = await dev.clearCache();
    notify(result.ok ? "Đã xoá" : "Lỗi", result.ok ? "Cache đã được xoá." : result.message);
  };

  const handleClearTokens = async () => {
    const ok = await confirmAction({
      title: "Xoá token",
      message: "Request kế tiếp sẽ bị 401 và ứng dụng quay về màn hình đăng nhập (dùng để thử luồng hết phiên).",
      confirmText: "Xoá token",
      destructive: true,
    });
    if (!ok) return;
    const result = await dev.clearTokens();
    notify(result.ok ? "Đã xoá" : "Lỗi", result.ok ? "Token đã được xoá khỏi máy." : result.message);
  };

  return (
    <PageScreen title="Công cụ phát triển">
      <View className="gap-2">
        <AppText variant="label">Môi trường</AppText>
        <Card className="gap-2 p-4">
          <Row label="API" value={dev.apiUrl} />
          <Row label="Dữ liệu mock" value={dev.useMock ? "Bật" : "Tắt"} />
        </Card>
      </View>

      <View className="gap-2">
        <AppText variant="label">Trạng thái đồng bộ (GET /v1/sync-statuses)</AppText>
        <Card className="gap-2 p-4">
          {dev.isSyncLoading && <ActivityIndicator color={brand.DEFAULT} />}
          {dev.syncError && <AppText variant="error">{dev.syncError}</AppText>}
          {dev.statuses.map((s) => (
            <Row key={s.id} label={s.code} value={s.name} />
          ))}
          {!dev.isSyncLoading && !dev.syncError && dev.statuses.length === 0 && (
            <AppText variant="caption">Chưa có dữ liệu. BE cần seed bảng sync_statuses.</AppText>
          )}
        </Card>
      </View>

      <View className="gap-2">
        <AppText variant="label">Danh sách do BE cung cấp</AppText>
        <Card className="gap-2 p-4">
          {dev.isMetaLoading && <ActivityIndicator color={brand.DEFAULT} />}
          {dev.metaError && <AppText variant="error">{dev.metaError}</AppText>}
          {dev.units.length > 0 && <Row label="units" value={dev.units.join(", ")} />}
          {dev.enums &&
            Object.entries(dev.enums).map(([key, values]) => (
              <Row key={key} label={key} value={(values as string[]).join(", ")} />
            ))}
        </Card>
      </View>

      <Button title="Tải lại dữ liệu từ BE" variant="outline" onPress={() => void dev.reloadAll()} />
      <Button title="Xoá cache" variant="danger" onPress={() => void handleClearCache()} />
      <Button title="Xoá token (thử hết phiên)" variant="danger" onPress={() => void handleClearTokens()} />
    </PageScreen>
  );
}
