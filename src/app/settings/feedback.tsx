import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { PageScreen } from "@/components/ui/PageScreen";
import { TextArea } from "@/components/ui/TextArea";
import { FEEDBACK_MAX_LENGTH, FEEDBACK_TYPE_OPTIONS } from "@/features/feedback/feedbackTypes";
import { useFeedbackForm } from "@/features/feedback/useFeedbackForm";

export default function FeedbackScreen() {
  const router = useRouter();
  const form = useFeedbackForm();
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const result = await form.submit();
    if (result.ok) setSent(true);
  };

  if (sent) {
    return (
      <PageScreen title="Gửi phản hồi">
        <Card className="items-center gap-3 p-6">
          <AppText variant="heading">Cảm ơn bạn!</AppText>
          <AppText variant="caption" className="text-center">
            Phản hồi của bạn đã được gửi. Chúng mình sẽ xem và cải thiện ứng dụng.
          </AppText>
        </Card>
        <Button title="Gửi thêm phản hồi" variant="outline" onPress={() => setSent(false)} />
        <Button title="Quay lại" onPress={() => router.back()} />
      </PageScreen>
    );
  }

  return (
    <PageScreen title="Gửi phản hồi">
      <View className="gap-2">
        <AppText variant="caption" className="font-semibold">
          Loại phản hồi
        </AppText>
        <ChipGroup options={FEEDBACK_TYPE_OPTIONS} value={form.values.type} onChange={form.setType} />
      </View>

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

      <Button title="Gửi phản hồi" loading={form.isSubmitting} onPress={() => void handleSubmit()} />
    </PageScreen>
  );
}
