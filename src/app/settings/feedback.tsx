import { useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { PageScreen } from "@/components/ui/PageScreen";
import { TextArea } from "@/components/ui/TextArea";
import { useAppTheme } from "@/core/theme/useAppTheme";
import {
  FEEDBACK_MAX_LENGTH,
  FEEDBACK_TYPE_OPTIONS,
} from "@/features/feedback/feedbackTypes";
import { useFeedbackForm } from "@/features/feedback/useFeedbackForm";

export default function FeedbackScreen() {
  const router = useRouter();
  const { brand, palette } = useAppTheme();
  const form = useFeedbackForm();
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const result = await form.submit();
    if (result.ok) setSent(true);
  };

  if (sent) {
    return (
      <PageScreen title="Gửi phản hồi">
        <View className="gap-5 pb-10 pt-4">
          <Card className="items-center gap-3 bg-successBg/50 p-8 shadow-sm dark:bg-successBg-dark">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-surface dark:bg-soft-dark">
              <Ionicons name="heart" size={48} color={palette.successInk} />
            </View>
            <AppText variant="heading" className="text-xl">
              Cảm ơn bạn!
            </AppText>
            <AppText variant="caption" className="text-center">
              Phản hồi của bạn đã được gửi. Chúng mình sẽ xem và cải thiện ứng
              dụng.
            </AppText>
          </Card>
          <Button
            title="Gửi thêm phản hồi"
            variant="outline"
            onPress={() => setSent(false)}
          />
          <Button title="Quay lại" onPress={() => router.back()} />
        </View>
      </PageScreen>
    );
  }

  return (
    <PageScreen title="Gửi phản hồi">
      <View className="gap-5 pb-10 pt-4">
        {/* Intro */}
        <Card className="flex-row items-center gap-3 bg-brandSoft/40 p-4 shadow-sm dark:bg-surface-dark">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-surface dark:bg-soft-dark">
            <Ionicons name="chatbubble-ellipses" size={22} color={brand} />
          </View>
          <AppText variant="caption" className="flex-1">
            Ý kiến của bạn giúp ứng dụng tốt hơn mỗi ngày.
          </AppText>
        </Card>

        {/* Type */}
        <View className="gap-2.5">
          <View className="flex-row items-center gap-2 px-1">
            <View className="h-8 w-8 items-center justify-center rounded-xl bg-brandSoft dark:bg-surface-dark">
              <Ionicons name="pricetag" size={16} color={brand} />
            </View>
            <AppText variant="heading" className="text-base">
              Loại phản hồi
            </AppText>
          </View>
          <ChipGroup
            options={FEEDBACK_TYPE_OPTIONS}
            value={form.values.type}
            onChange={form.setType}
          />
        </View>

        {/* Message */}
        <Card className="gap-3 p-4 shadow-sm">
          <TextArea
            label="Nội dung"
            placeholder="Bạn gặp lỗi gì, hoặc muốn ứng dụng tốt hơn ở điểm nào?"
            autoCapitalize="sentences"
            maxLength={FEEDBACK_MAX_LENGTH + 100}
            value={form.values.message}
            onChangeText={form.setMessage}
            error={form.error}
            hint={`Còn ${form.remaining} ký tự. Phiên bản ứng dụng và thiết bị sẽ được gửi kèm để dễ xử lý.`}
          />
          <Button
            title="Gửi phản hồi"
            loading={form.isSubmitting}
            onPress={() => void handleSubmit()}
          />
        </Card>
      </View>
    </PageScreen>
  );
}
