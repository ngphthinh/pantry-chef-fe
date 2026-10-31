// onboarding.tsx
import React, { useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { LivingBackground4D } from "@/components/auth/LivingBackground4D";
import { TactileButton } from "@/components/ui/TactileButton";
import { kvStorage } from "@/core/di/container";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { ONBOARDING_KEY } from "@/features/auth/onboardingFlag";

type Slide = {
  icon: keyof typeof Ionicons.glyphMap;
  tone: "brand" | "warnInk" | "successInk";
  title: string;
  desc: string;
};

const SLIDES: Slide[] = [
  {
    icon: "basket",
    tone: "brand",
    title: "Quản lý tủ nguyên liệu",
    desc: "Theo dõi những gì bạn đang có, số lượng và hạn sử dụng để không còn lãng phí thực phẩm.",
  },
  {
    icon: "search",
    tone: "warnInk",
    title: "Tìm công thức thông minh",
    desc: "Gợi ý món ăn dựa trên nguyên liệu sẵn có trong tủ, lưu lại món yêu thích để nấu lại.",
  },
  {
    icon: "calendar",
    tone: "successInk",
    title: "Lên thực đơn mỗi tuần",
    desc: "Sắp xếp bữa sáng, trưa, tối và tự động tạo danh sách mua sắm cho cả tuần.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, brand, palette } = useAppTheme();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;
  const colorOf = (tone: Slide["tone"]) =>
    tone === "brand" ? brand : palette[tone];

  const start = async () => {
    await kvStorage.set(ONBOARDING_KEY, "1");
    router.replace("/login");
  };

  const next = () => {
    if (isLast) {
      void start();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View className="flex-1">
      <LivingBackground4D isDark={isDark} />

      <View
        className="flex-1"
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 16,
        }}>
        <View className="h-10 flex-row items-center justify-between px-5">
          <AppText className="text-sm font-black tracking-[2px] text-ink dark:text-ink-dark">
            PANTRY CHEF
          </AppText>
          {!isLast ? (
            <Pressable hitSlop={10} onPress={() => void start()}>
              <AppText className="text-sm font-semibold text-muted dark:text-muted-dark">
                Bỏ qua
              </AppText>
            </Pressable>
          ) : null}
        </View>

        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(s) => s.title}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          renderItem={({ item }) => {
            const color = colorOf(item.tone);
            return (
              <View
                style={{ width }}
                className="flex-1 items-center justify-center px-8">
                <View
                  className="mb-8 h-44 w-44 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${color}22` }}>
                  <View
                    className="h-32 w-32 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${color}33` }}>
                    <Ionicons name={item.icon} size={64} color={color} />
                  </View>
                </View>
                <AppText
                  variant="title"
                  className="text-center text-[26px] font-black text-ink dark:text-ink-dark">
                  {item.title}
                </AppText>
                <AppText
                  variant="caption"
                  className="mt-3 text-center text-[15px] leading-6 text-muted dark:text-muted-dark">
                  {item.desc}
                </AppText>
              </View>
            );
          }}
        />

        <View className="mb-6 flex-row items-center justify-center gap-2">
          {SLIDES.map((s, i) => (
            <View
              key={s.title}
              className={
                i === index
                  ? "h-2 w-7 rounded-full bg-brand"
                  : "h-2 w-2 rounded-full bg-line dark:bg-line-dark"
              }
            />
          ))}
        </View>

        <View className="px-5">
          <TactileButton
            title={isLast ? "Bắt đầu" : "Tiếp tục"}
            onPress={next}
          />
        </View>
      </View>
    </View>
  );
}
