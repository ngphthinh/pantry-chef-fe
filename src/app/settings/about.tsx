import { ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageScreen } from "@/components/ui/PageScreen";
import { APP_NAME, APP_VERSION } from "@/core/config/appInfo";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { usePrivacyPolicy } from "@/features/legal/usePrivacyPolicy";

export default function AboutScreen() {
  const { brand, palette } = useAppTheme();
  const { blocks, error, isLoading, retry } = usePrivacyPolicy();

  return (
    <PageScreen title="Giới thiệu">
      <View className="gap-5 pb-10">
        <Card className="items-center gap-2 bg-brandSoft/40 p-6 shadow-sm dark:bg-surface-dark">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-surface dark:bg-soft-dark">
            <Ionicons name="restaurant" size={30} color={brand} />
          </View>
          <AppText variant="heading">{APP_NAME}</AppText>
          <AppText variant="caption">Phiên bản {APP_VERSION}</AppText>
          <AppText className="mt-2 text-center">
            Quản lý tủ nguyên liệu, tìm món phù hợp với những gì bạn đang có,
            lên thực đơn và đi chợ gọn hơn.
          </AppText>
        </Card>

        <Card className="gap-3 p-4 shadow-sm">
          {isLoading ? (
            <ActivityIndicator color={brand} className="py-6" />
          ) : error ? (
            <View className="items-center gap-3 py-2">
              <AppText variant="error" className="text-center">
                {error}
              </AppText>
              <Button title="Thử lại" variant="outline" onPress={retry} />
            </View>
          ) : (
            blocks.map((b, i) => {
              switch (b.type) {
                case "title":
                  return (
                    <View key={i} className="flex-row items-center gap-2">
                      <View className="h-9 w-9 items-center justify-center rounded-xl bg-brandSoft dark:bg-soft-dark">
                        <Ionicons
                          name="shield-checkmark"
                          size={18}
                          color={brand}
                        />
                      </View>
                      <AppText variant="heading" className="flex-1 text-lg">
                        {b.text}
                      </AppText>
                    </View>
                  );
                case "heading":
                  return (
                    <AppText
                      key={i}
                      variant="heading"
                      className="mt-2 text-base">
                      {b.text}
                    </AppText>
                  );
                case "bullet":
                  return (
                    <View key={i} className="flex-row gap-2.5 pl-1">
                      <Ionicons
                        name="ellipse"
                        size={6}
                        color={palette.muted}
                        style={{ marginTop: 7 }}
                      />
                      <AppText variant="caption" className="flex-1 leading-5">
                        {b.text}
                      </AppText>
                    </View>
                  );
                default:
                  return (
                    <AppText key={i} variant="caption" className="leading-5">
                      {b.text}
                    </AppText>
                  );
              }
            })
          )}
        </Card>
      </View>
    </PageScreen>
  );
}
