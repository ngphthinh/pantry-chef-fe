import { Alert, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useAiIdeas } from "@/features/ai/useAiIdeals";
import { useIdeasForm } from "@/features/ai/useIdealForm";

function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <AppText
      variant="caption"
      className="-mt-2 px-1 font-semibold text-dangerInk dark:text-dangerInk-dark">
      {message}
    </AppText>
  );
}

export default function AiIdeasScreen() {
  const router = useRouter();
  const { brand, palette } = useAppTheme();
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
      <View className="gap-5 pb-10">
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full bg-soft active:scale-90 dark:bg-surface-dark">
            <Ionicons name="arrow-back" size={20} color={palette.ink} />
          </Pressable>
          <View className="flex-1">
            <AppText variant="title">Ý tưởng món từ tủ</AppText>
            <AppText variant="caption">
              AI gợi ý món dựa trên nguyên liệu bạn đang có
            </AppText>
          </View>
        </View>

        {/* Form */}
        <Card className="gap-4 bg-brandSoft/40 p-4 shadow-sm dark:bg-surface-dark">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-surface dark:bg-soft-dark">
              <Ionicons name="sparkles" size={22} color={brand} />
            </View>
            <View className="flex-1">
              <AppText variant="heading" className="text-base">
                Tuỳ chỉnh gợi ý
              </AppText>
              <AppText variant="caption">
                Để trống nếu không cần giới hạn
              </AppText>
            </View>
          </View>

          <TextField
            label="Số món muốn gợi ý (1-10)"
            value={values.limit}
            onChangeText={(t) => setField("limit", t)}
            keyboardType="number-pad"
          />
          <FieldError message={errors.limit} />

          <TextField
            label="Thời gian nấu tối đa (phút, không bắt buộc)"
            value={values.maxCookingMinutes}
            onChangeText={(t) => setField("maxCookingMinutes", t)}
            placeholder="Ví dụ: 30"
            keyboardType="number-pad"
          />
          <FieldError message={errors.maxCookingMinutes} />

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

        {/* Empty */}
        {isEmpty ? (
          <Card className="items-center gap-2 p-6 shadow-sm">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-brandSoft dark:bg-soft-dark">
              <Ionicons name="sparkles-outline" size={30} color={brand} />
            </View>
            <AppText variant="heading" className="mt-1">
              Chưa có gợi ý phù hợp
            </AppText>
            <AppText variant="caption" className="text-center">
              Hãy thêm nguyên liệu vào tủ rồi thử lại.
            </AppText>
          </Card>
        ) : null}

        {/* Results header */}
        {items.length > 0 ? (
          <View className="flex-row items-center justify-between px-1">
            <AppText
              variant="label"
              className="text-xs font-bold uppercase tracking-wider text-muted dark:text-muted-dark">
              Món gợi ý
            </AppText>
            <View className="rounded-full bg-brandSoft px-2.5 py-1 dark:bg-surface-dark">
              <AppText className="text-xs font-bold text-brand">
                {items.length}
              </AppText>
            </View>
          </View>
        ) : null}

        {/* Results */}
        {items.map((item, index) => (
          <Card key={item.key} className="gap-3.5 p-4 shadow-sm">
            <View className="flex-row items-start gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brand">
                <AppText className="font-extrabold text-white">
                  {index + 1}
                </AppText>
              </View>
              <View className="flex-1 gap-1.5">
                <AppText variant="heading" className="text-base">
                  {item.name}
                </AppText>
                <View className="flex-row flex-wrap gap-2">
                  {item.timeLabel ? (
                    <View className="flex-row items-center gap-1 rounded-full bg-soft px-2.5 py-1 dark:bg-soft-dark">
                      <Ionicons
                        name="time-outline"
                        size={13}
                        color={palette.muted}
                      />
                      <AppText variant="caption">{item.timeLabel}</AppText>
                    </View>
                  ) : null}
                  {item.matchLabel ? (
                    <View className="flex-row items-center gap-1 rounded-full bg-successBg px-2.5 py-1 dark:bg-successBg-dark">
                      <Ionicons
                        name="checkmark-circle"
                        size={13}
                        color={palette.successInk}
                      />
                      <AppText
                        variant="caption"
                        className="font-bold text-successInk dark:text-successInk-dark">
                        {item.matchLabel}
                      </AppText>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            {item.description ? <AppText>{item.description}</AppText> : null}

            {item.used.length > 0 ? (
              <View className="gap-2 border-t border-line pt-3 dark:border-line-dark">
                <View className="flex-row items-center gap-1.5">
                  <Ionicons
                    name="checkmark-done"
                    size={15}
                    color={palette.successInk}
                  />
                  <AppText variant="label">Đã có trong tủ</AppText>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {item.used.map((name) => (
                    <View
                      key={name}
                      className="rounded-full bg-successBg px-3 py-1 dark:bg-successBg-dark">
                      <AppText
                        variant="caption"
                        className="font-semibold text-successInk dark:text-successInk-dark">
                        {name}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {item.missing.length > 0 ? (
              <View className="gap-2 border-t border-line pt-3 dark:border-line-dark">
                <View className="flex-row items-center gap-1.5">
                  <Ionicons
                    name="alert-circle"
                    size={15}
                    color={palette.warnInk}
                  />
                  <AppText variant="label">Còn thiếu</AppText>
                </View>
                <AppText variant="caption">
                  Chạm vào nguyên liệu để xem gợi ý thay thế
                </AppText>
                <View className="flex-row flex-wrap gap-2">
                  {item.missing.map((name) => (
                    <Pressable
                      key={name}
                      onPress={() =>
                        router.push({
                          pathname: "/ai/substitutions",
                          params: {
                            recipeTitle: item.name,
                            missingIngredient: name,
                          },
                        })
                      }
                      className="flex-row items-center gap-1.5 rounded-full bg-warnBg px-3 py-1.5 active:scale-95 dark:bg-warnBg-dark">
                      <AppText
                        variant="caption"
                        className="font-semibold text-warnInk dark:text-warnInk-dark">
                        {name}
                      </AppText>
                      <Ionicons
                        name="swap-horizontal"
                        size={14}
                        color={palette.warnInk}
                      />
                    </Pressable>
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
