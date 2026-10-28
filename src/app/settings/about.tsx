import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { PageScreen } from "@/components/ui/PageScreen";
import { APP_NAME, APP_VERSION } from "@/core/config/appInfo";
import { useAppTheme } from "@/core/theme/useAppTheme";

// Nội dung tĩnh. Phần quyền riêng tư là bản nháp, nhóm cần rà lại trước khi phát hành.
const PRIVACY_POINTS = [
  "Ứng dụng lưu email, tên hiển thị và dữ liệu bạn nhập (tủ nguyên liệu, thực đơn, công thức, danh sách mua sắm) để đồng bộ giữa các thiết bị.",
  "Ảnh bạn chụp để nhận diện nguyên liệu được gửi tới dịch vụ AI bên ngoài để xử lý.",
  "Công thức gợi ý lấy từ nhà cung cấp công thức bên ngoài.",
  "Gợi ý của AI chỉ nhằm hỗ trợ nấu ăn, không phải lời khuyên y tế hay dinh dưỡng.",
  "Bạn có thể xoá tài khoản bất cứ lúc nào trong phần Hồ sơ.",
];

export default function AboutScreen() {
  const { brand } = useAppTheme();

  return (
    <PageScreen title="Giới thiệu">
      <Card className="items-center gap-2 p-6">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-soft dark:bg-soft-dark">
          <Ionicons name="restaurant" size={30} color={brand} />
        </View>
        <AppText variant="heading">{APP_NAME}</AppText>
        <AppText variant="caption">Phiên bản {APP_VERSION}</AppText>
        <AppText className="mt-2 text-center">
          Quản lý tủ nguyên liệu, tìm món phù hợp với những gì bạn đang có, lên thực đơn và đi chợ gọn hơn.
        </AppText>
      </Card>

      <View className="gap-2">
        <AppText variant="label">Quyền riêng tư</AppText>
        <Card className="gap-3 p-4">
          {PRIVACY_POINTS.map((point) => (
            <View key={point} className="flex-row gap-3">
              <Ionicons name="shield-checkmark-outline" size={18} color={brand} />
              <AppText variant="caption" className="flex-1">
                {point}
              </AppText>
            </View>
          ))}
        </Card>
      </View>
    </PageScreen>
  );
}
