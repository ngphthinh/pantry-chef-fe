import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { brand } from "@/core/theme/colors";

interface BackHeaderProps {
    title: string;
    subtitle?: string;
    /** Nút thao tác bên phải (sửa, xoá...). */
    right?: ReactNode;
    /** Đi tới đây khi không có màn hình trước (ví dụ tải lại trang trên web). */
    fallbackHref?: Href;
}

export function BackHeader({ title, subtitle, right, fallbackHref = "/" }: BackHeaderProps) {
    const router = useRouter();

    const goBack = () => {
        if (router.canGoBack()) router.back();
        else router.replace(fallbackHref);
    };

    return (
        <View className="flex-row items-center gap-3">
            <Pressable
                onPress={goBack}
                className="h-10 w-10 items-center justify-center rounded-full bg-surface"
            >
                <Ionicons name="arrow-back" size={22} color={brand.DEFAULT} />
            </Pressable>

            <View className="flex-1">
                <AppText variant="title" numberOfLines={1}>
                    {title}
                </AppText>
                {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
            </View>

            {right}
        </View>
    );
}