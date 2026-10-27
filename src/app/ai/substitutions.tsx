import { Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { brand } from "@/core/theme/colors";
import { useSubstitutions } from "@/features/ai/useSubstitutions";
import { useSubstitutionForm } from "@/features/ai/useSubstitutionform";

export default function AiSubstitutionsScreen() {
  const router = useRouter();
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
      <View className="gap-5 pb-8">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface">
            <Ionicons name="arrow-back" size={22} color={brand.DEFAULT} />
          </Pressable>

          <View className="flex-1">
            <AppText variant="title">Nguyên liệu thay thế</AppText>
            <AppText variant="caption">
              AI gợi ý tối đa 3 nguyên liệu có thể dùng thay
            </AppText>
          </View>
        </View>

        <Card className="gap-4 p-4">
          <TextField
            label="Nguyên liệu cần thay thế"
            value={values.missingIngredient}
            onChangeText={(t) => setField("missingIngredient", t)}
            placeholder="Ví dụ: Bơ"
          />
          {errors.missingIngredient ? (
            <AppText variant="caption" className="text-danger">
              {errors.missingIngredient}
            </AppText>
          ) : null}

          <TextField
            label={
              titleRequired ? "Dùng cho món" : "Dùng cho món (không bắt buộc)"
            }
            value={values.recipeTitle}
            onChangeText={(t) => setField("recipeTitle", t)}
            placeholder="Ví dụ: Phở bò"
          />
          {errors.recipeTitle ? (
            <AppText variant="caption" className="text-danger">
              {errors.recipeTitle}
            </AppText>
          ) : null}

          <Button
            title="Tìm nguyên liệu thay thế"
            loading={isSubmitting}
            onPress={submit}
          />
        </Card>

        {requestError ? (
          <Card className="gap-1 border border-danger p-4">
            <AppText variant="heading" className="text-danger">
              Không thể tìm gợi ý
            </AppText>
            <AppText variant="caption">{requestError}</AppText>
          </Card>
        ) : null}

        {isEmpty ? (
          <Card className="items-center gap-2 p-5">
            <Ionicons
              name="swap-horizontal-outline"
              size={28}
              color={brand.DEFAULT}
            />
            <AppText variant="heading">Chưa có gợi ý thay thế</AppText>
            <AppText variant="caption">
              Thử đổi tên nguyên liệu hoặc nhập thêm tên món.
            </AppText>
          </Card>
        ) : null}

        {items.map((item) => (
          <Card key={item.key} className="gap-2 p-4">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <AppText variant="heading">{item.name}</AppText>
                <AppText variant="caption">
                  {[item.ratioLabel, item.confidenceLabel]
                    .filter(Boolean)
                    .join(" · ")}
                </AppText>
              </View>
              <Ionicons
                name="swap-horizontal-outline"
                size={22}
                color={brand.DEFAULT}
              />
            </View>

            {item.note ? <AppText>{item.note}</AppText> : null}
          </Card>
        ))}
      </View>
    </Screen>
  );
}
