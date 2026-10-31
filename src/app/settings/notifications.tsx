import { ActivityIndicator, Switch, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { PageScreen } from "@/components/ui/PageScreen";
import { formatDateTime } from "@/core/format/datetime";
import { brand } from "@/core/theme/colors";
import { notify } from "@/core/ui/dialogs";
import { useExpiryReminder } from "@/features/expiryReminder/useExpiryReminder";
import { DAYS_BEFORE_OPTIONS, REMINDER_HOUR_OPTIONS } from "@/features/expiryReminder/types";

const DAY_CHIPS = DAYS_BEFORE_OPTIONS.map((n) => ({ value: String(n), label: `${n} ngày` }));
const HOUR_CHIPS = REMINDER_HOUR_OPTIONS.map((h) => ({ value: String(h), label: `${h}:00` }));

export default function NotificationsScreen() {
  const reminder = useExpiryReminder();
  const { settings, permission, plan } = reminder;

  const report = (result: { ok: boolean; message?: string }) => {
    if (!result.ok) notify("Lỗi", result.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.");
  };

  if (!reminder.isSupported) {
    return (
      <PageScreen title="Nhắc hết hạn">
        <Card className="gap-2 p-5">
          <AppText className="font-bold">Chưa hỗ trợ trên web</AppText>
          <AppText variant="caption">
            Nhắc hết hạn dùng thông báo của thiết bị nên chỉ hoạt động trên ứng dụng điện thoại.
          </AppText>
        </Card>
      </PageScreen>
    );
  }

  return (
    <PageScreen title="Nhắc hết hạn">
      <AppText variant="caption">
        Nhận thông báo vào giờ bạn chọn khi trong tủ có nguyên liệu sắp hết hạn.
      </AppText>

      {reminder.isLoading ? (
        <ActivityIndicator color={brand.DEFAULT} />
      ) : (
        <>
          <Card className="flex-row items-center gap-3 p-4">
            <View className="flex-1">
              <AppText className="font-bold">Nhắc nguyên liệu sắp hết hạn</AppText>
              <AppText variant="caption">
                {settings.enabled ? "Đang bật" : "Đang tắt"}
              </AppText>
            </View>
            <Switch
              value={settings.enabled}
              disabled={reminder.isApplying}
              onValueChange={(value) => void reminder.setEnabled(value).then(report)}
              trackColor={{ true: brand.DEFAULT }}
            />
          </Card>

          {permission === "denied" && (
            <Card className="gap-3 p-4">
              <AppText variant="error">
                Thông báo của ứng dụng đang bị tắt trong cài đặt thiết bị nên không thể nhắc.
              </AppText>
              <Button title="Mở cài đặt thiết bị" variant="outline" onPress={() => void reminder.openSystemSettings()} />
            </Card>
          )}

          {settings.enabled && (
            <>
              <View className="gap-2">
                <AppText variant="label">Nhắc những món hết hạn trong</AppText>
                <ChipGroup
                  options={DAY_CHIPS}
                  value={String(settings.daysBefore)}
                  onChange={(v) => void reminder.setDaysBefore(Number(v)).then(report)}
                />
              </View>

              <View className="gap-2">
                <AppText variant="label">Giờ nhắc mỗi ngày</AppText>
                <ChipGroup
                  options={HOUR_CHIPS}
                  value={String(settings.hour)}
                  onChange={(v) => void reminder.setHour(Number(v)).then(report)}
                />
              </View>

              <Card className="gap-1 p-4">
                {plan?.scheduled && plan.fireAt ? (
                  <>
                    <AppText className="font-bold">Lần nhắc tiếp theo</AppText>
                    <AppText variant="caption">
                      {formatDateTime(plan.fireAt)} · {plan.itemCount} món sắp hết hạn
                    </AppText>
                  </>
                ) : (
                  <AppText variant="caption">
                    Hiện chưa có món nào sắp hết hạn nên chưa đặt thông báo.
                  </AppText>
                )}
              </Card>

              <Button
                title="Cập nhật lịch nhắc ngay"
                variant="outline"
                loading={reminder.isApplying}
                onPress={() => void reminder.refreshNow().then(report)}
              />
              <AppText variant="caption">
                Nội dung thông báo được tính theo tủ nguyên liệu tại thời điểm lên lịch, và được cập nhật lại mỗi khi bạn đổi cài đặt hoặc bấm nút trên. Hãy mở ứng dụng thường xuyên để thông báo luôn đúng.
              </AppText>
            </>
          )}
        </>
      )}
    </PageScreen>
  );
}
