import { Alert, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { brand } from "@/core/theme/colors";
import { useAiIdeas } from "@/features/ai/useAiIdeals";
import { useIdeasForm } from "@/features/ai/useIdealForm";

export default function AiIdeasScreen() {
  const router = useRouter();
  const { items, isEmpty } = useAiIdeas();
  const { values, errors, setField, submit, isSubmitting } = useIdeasForm();

  const handleSubmit = async () => {
    const result = await submit();
    if (!result.ok && result.kind === "request") {
      Alert.alert("Lỗi", result.message);
    }
  };

  return (
    <Screen>
      <View className="gap-5 pb-8">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface">
            <Ionicons name="arrow-back" size={22} color={brand.DEFAULT} />
          </Pressable>

          <View className="flex-1">
            <AppText variant="title">Ý tưởng món từ tủ</AppText>
            <AppText variant="caption">
              AI gợi ý món dựa trên nguyên liệu bạn đang có
            </AppText>
          </View>
        </View>

        <Card className="gap-4 p-4">
          <TextField
            label="Số món muốn gợi ý (1-10)"
            value={values.limit}
            onChangeText={(t) => setField("limit", t)}
            keyboardType="number-pad"
          />
          {errors.limit ? (
            <AppText variant="caption" className="text-danger">
              {errors.limit}
            </AppText>
          ) : null}

          <TextField
            label="Thời gian nấu tối đa (phút, không bắt buộc)"
            value={values.maxCookingMinutes}
            onChangeText={(t) => setField("maxCookingMinutes", t)}
            placeholder="Ví dụ: 30"
            keyboardType="number-pad"
          />
          {errors.maxCookingMinutes ? (
            <AppText variant="caption" className="text-danger">
              {errors.maxCookingMinutes}
            </AppText>
          ) : null}

          <TextField
            label="Ẩm thực (không bắt buộc)"
            value={values.cuisine}
            onChangeText={(t) => setField("cuisine", t)}
            placeholder="Ví dụ: Việt Nam, Italian"
          />

          <Button
            title="Gợi ý món"
            loading={isSubmitting}
            onPress={handleSubmit}
          />
        </Card>

        {isEmpty ? (
          <Card className="items-center gap-2 p-5">
            <Ionicons name="sparkles-outline" size={28} color={brand.DEFAULT} />
            <AppText variant="heading">Chưa có gợi ý phù hợp</AppText>
            <AppText variant="caption">
              Hãy thêm nguyên liệu vào tủ rồi thử lại.
            </AppText>
          </Card>
        ) : null}

        {items.map((item) => (
          <Card key={item.key} className="gap-3 p-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <AppText variant="heading">{item.name}</AppText>
                <AppText variant="caption">
                  {item.timeLabel} · {item.matchLabel}
                </AppText>
              </View>
            </View>

            {item.description ? <AppText>{item.description}</AppText> : null}

            {item.used.length > 0 ? (
              <View className="gap-1">
                <AppText variant="label">Đã có trong tủ</AppText>
                <View className="flex-row flex-wrap gap-2">
                  {item.used.map((name) => (
                    <View
                      key={name}
                      className="rounded-full bg-brandSoft px-3 py-1">
                      <AppText variant="caption" className="text-brand">
                        {name}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {item.missing.length > 0 ? (
              <View className="gap-1">
                <AppText variant="label">Còn thiếu</AppText>
                <View className="flex-row flex-wrap gap-2">
                  {item.missing.map((name) => (
                    <View
                      key={name}
                      className="rounded-full border border-border bg-surface px-3 py-1">
                      <AppText variant="caption">{name}</AppText>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </Card>
        ))}
      </View>
    </Screen>
  );
}
