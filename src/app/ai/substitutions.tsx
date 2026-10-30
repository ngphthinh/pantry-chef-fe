import { Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useSubstitutions } from "@/features/ai/useSubstitutions";
import { useSubstitutionForm } from "@/features/ai/useSubstitutionform";

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

export default function AiSubstitutionsScreen() {
  const router = useRouter();
  const { brand, palette } = useAppTheme();
  const params = useLocalSearchParams<{
    recipeId?: string;
    recipeTitle?: string;
    missingIngredient?: string;
  }>();

  const { items, isEmpty } = useSubstitutions();
  const {
    values,
    errors,
    requestError,
    titleRequired,
    setField,
    submit,
    isSubmitting,
  } = useSubstitutionForm(params);

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
            <AppText variant="title">Nguyên liệu thay thế</AppText>
            <AppText variant="caption">
              AI gợi ý tối đa 3 nguyên liệu có thể dùng thay
            </AppText>
          </View>
        </View>

        {/* Form */}
        <Card className="gap-4 bg-brandSoft/40 p-4 shadow-sm dark:bg-surface-dark">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-surface dark:bg-soft-dark">
              <Ionicons name="swap-horizontal" size={22} color={brand} />
            </View>
            <View className="flex-1">
              <AppText variant="heading" className="text-base">
                Tìm thay thế
              </AppText>
              <AppText variant="caption">
                Nhập nguyên liệu bạn đang thiếu
              </AppText>
            </View>
          </View>

          <TextField
            label="Nguyên liệu cần thay thế"
            value={values.missingIngredient}
            onChangeText={(t) => setField("missingIngredient", t)}
            placeholder="Ví dụ: Bơ"
          />
          <FieldError message={errors.missingIngredient} />

          <TextField
            label={
              titleRequired ? "Dùng cho món" : "Dùng cho món (không bắt buộc)"
            }
            value={values.recipeTitle}
            onChangeText={(t) => setField("recipeTitle", t)}
            placeholder="Ví dụ: Phở bò"
          />
          <FieldError message={errors.recipeTitle} />

          <Button
            title="Tìm nguyên liệu thay thế"
            loading={isSubmitting}
            onPress={submit}
          />
        </Card>

        {/* Request error */}
        {requestError ? (
          <Card className="flex-row items-start gap-3 border border-dangerInk/40 bg-dangerBg/40 p-4 dark:border-dangerInk-dark/40 dark:bg-dangerBg-dark">
            <Ionicons name="alert-circle" size={22} color={palette.dangerInk} />
            <View className="flex-1 gap-0.5">
              <AppText
                variant="heading"
                className="text-base text-dangerInk dark:text-dangerInk-dark">
                Không thể tìm gợi ý
              </AppText>
              <AppText variant="caption">{requestError}</AppText>
            </View>
          </Card>
        ) : null}

        {/* Empty */}
        {isEmpty ? (
          <Card className="items-center gap-2 p-6 shadow-sm">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-brandSoft dark:bg-soft-dark">
              <Ionicons
                name="swap-horizontal-outline"
                size={30}
                color={brand}
              />
            </View>
            <AppText variant="heading" className="mt-1">
              Chưa có gợi ý thay thế
            </AppText>
            <AppText variant="caption" className="text-center">
              Thử đổi tên nguyên liệu hoặc nhập thêm tên món.
            </AppText>
          </Card>
        ) : null}

        {/* Results header */}
        {items.length > 0 ? (
          <View className="flex-row items-center justify-between px-1">
            <AppText
              variant="label"
              className="text-xs font-bold uppercase tracking-wider text-muted dark:text-muted-dark">
              Gợi ý thay thế
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
          <Card key={item.key} className="gap-3 p-4 shadow-sm">
            <View className="flex-row items-center gap-3">
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
                  {item.ratioLabel ? (
                    <View className="flex-row items-center gap-1 rounded-full bg-soft px-2.5 py-1 dark:bg-soft-dark">
                      <Ionicons
                        name="scale-outline"
                        size={13}
                        color={palette.muted}
                      />
                      <AppText variant="caption">{item.ratioLabel}</AppText>
                    </View>
                  ) : null}
                  {item.confidenceLabel ? (
                    <View className="flex-row items-center gap-1 rounded-full bg-successBg px-2.5 py-1 dark:bg-successBg-dark">
                      <Ionicons
                        name="checkmark-circle"
                        size={13}
                        color={palette.successInk}
                      />
                      <AppText
                        variant="caption"
                        className="font-bold text-successInk dark:text-successInk-dark">
                        {item.confidenceLabel}
                      </AppText>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            {item.note ? (
              <View className="border-t border-line pt-3 dark:border-line-dark">
                <AppText>{item.note}</AppText>
              </View>
            ) : null}
          </Card>
        ))}
      </View>
    </Screen>
  );
}
