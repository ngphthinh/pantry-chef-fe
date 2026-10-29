import { useState } from "react";
import { ActivityIndicator, Image, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";

import {BackHeader} from "@/components/ui/BackHeader";
import { AppText } from "@/components/ui/AppText";
import { AddToCollectionModal } from "@/components/ui/AddToCollectionModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { brand } from "@/core/theme/colors";
import { notify } from "@/core/ui/dialogs";
import { useSavedRecipeForm } from "@/features/savedRecipes/useSavedRecipeForm";

export default function SavedRecipeScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { recipe, values, errors, setField, submit, isDirty, isLoading, isSubmitting, loadError } =
        useSavedRecipeForm(id);
    const [pickerOpen, setPickerOpen] = useState(false);

    const handleSave = async () => {
        const result = await submit();
        if (result.ok) router.back();
        else notify("Lỗi", result.message);
    };

    if (isLoading) {
        return (
            <Screen>
                <BackHeader title="Món đã lưu" fallbackHref={"/saved" as Href} />
                <ActivityIndicator color={brand.DEFAULT} />
            </Screen>

        );
    }

    if (!recipe) {
        return (
            <Screen>
                <AppText variant="caption">{loadError ?? "Không tìm thấy món đã lưu."}</AppText>
            </Screen>
        );
    }

    return (
        <Screen>
            <BackHeader title="Món đã lưu" fallbackHref={"/saved" as Href} />
            {recipe.imageUrl ? (
                <Image
                    source={{ uri: recipe.imageUrl }}
                    className="h-52 w-full rounded-2xl"
                    resizeMode="cover"
                />
            ) : null}

            <AppText variant="title">{recipe.title}</AppText>
            <AppText variant="caption">
                {recipe.servings} khẩu phần
                {recipe.readyInMinutes ? ` · ${recipe.readyInMinutes} phút` : ""}
            </AppText>

            <Card className="flex-row items-center justify-between p-4">
                <View className="flex-row gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <Pressable
                            key={n}
                            hitSlop={6}
                            onPress={() => setField("rating", values.rating === n ? 0 : n)}
                        >
                            <Ionicons
                                name={n <= values.rating ? "star" : "star-outline"}
                                size={26}
                                color={brand.DEFAULT}
                            />
                        </Pressable>
                    ))}
                </View>
                <Pressable hitSlop={8} onPress={() => setField("favorite", !values.favorite)}>
                    <Ionicons
                        name={values.favorite ? "heart" : "heart-outline"}
                        size={26}
                        color={brand.DEFAULT}
                    />
                </Pressable>
            </Card>
            {errors.rating ? <AppText variant="caption">{errors.rating}</AppText> : null}

            <TextField
                label="Ghi chú"
                value={values.note}
                onChangeText={(t) => setField("note", t)}
                error={errors.note}
                multiline
            />

            <Button title="Thêm vào bộ sưu tập" onPress={() => setPickerOpen(true)} />

            <AppText variant="heading">Nguyên liệu</AppText>
            {recipe.ingredients.length === 0 ? (
                <AppText variant="caption">Chưa có dữ liệu nguyên liệu.</AppText>
            ) : (
                recipe.ingredients.map((ing) => (
                    <AppText key={ing.id}>
                        {`• ${[ing.amount, ing.unit, ing.name]
                            .filter((v) => v !== undefined && v !== null)
                            .join(" ")}`}
                    </AppText>
                ))
            )}

            <AppText variant="heading">Các bước</AppText>
            {recipe.steps.length === 0 ? (
                <AppText variant="caption">Chưa có dữ liệu các bước.</AppText>
            ) : (
                recipe.steps.map((s, index) => (
                    <AppText key={s.id}>{`${index + 1}. ${s.text}`}</AppText>
                ))
            )}

            <Button
                title="Lưu thay đổi"
                loading={isSubmitting}
                disabled={!isDirty}
                onPress={handleSave}
            />

            <AddToCollectionModal
                visible={pickerOpen}
                savedRecipeId={id}
                onClose={() => setPickerOpen(false)}
            />
        </Screen>
    );
}