import { ActivityIndicator, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListScreen } from "@/components/ui/ListScreen";
import { TextField } from "@/components/ui/TextField";
import { brand } from "@/core/theme/colors";
import {
  useAdminFeedback,
  type AdminFeedbackItem,
  type FeedbackTone,
} from "@/features/admin/useAdminFeedback";

// Class viết nguyên văn để NativeWind nhận diện. Có thể đổi sang token màu của dự án.
const TONE_STYLES: Record<FeedbackTone, { badge: string; text: string }> = {
  bug: {
    badge: "bg-red-100 dark:bg-red-950",
    text: "text-red-700 dark:text-red-300",
  },
  suggestion: {
    badge: "bg-amber-100 dark:bg-amber-950",
    text: "text-amber-700 dark:text-amber-300",
  },
  other: {
    badge: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-300",
  },
};

function FeedbackCard({ item }: { item: AdminFeedbackItem }) {
  const tone = TONE_STYLES[item.tone];

  return (
    <Card className="gap-2 p-4">
      <View className="flex-row items-center justify-between gap-3">
        <View className={`rounded-full px-3 py-1 ${tone.badge}`}>
          <AppText variant="caption" className={tone.text}>
            {item.typeLabel}
          </AppText>
        </View>
        <AppText variant="caption">{item.dateLabel}</AppText>
      </View>

      <AppText>{item.message}</AppText>
      <AppText variant="caption">{item.author}</AppText>
      {item.deviceLabel ? (
        <AppText variant="caption">{item.deviceLabel}</AppText>
      ) : null}
    </Card>
  );
}

export default function AdminFeedbackScreen() {
  const router = useRouter();
  const {
    items,
    keyword,
    setKeyword,
    typeOptions,
    setType,
    error,
    isLoading,
    isLoadingMore,
    isEmpty,
    loadMore,
    retry,
  } = useAdminFeedback();

  const header = (
    <View className="gap-5 pb-1">
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface">
          <Ionicons name="arrow-back" size={22} color={brand.DEFAULT} />
        </Pressable>

        <View className="flex-1">
          <AppText variant="title">Phản hồi</AppText>
          <AppText variant="caption">Góp ý và báo lỗi từ người dùng</AppText>
        </View>
      </View>

      <TextField
        label="Tìm kiếm"
        value={keyword}
        onChangeText={setKeyword}
        placeholder="Nội dung phản hồi"
      />

      <View className="flex-row flex-wrap gap-2">
        {typeOptions.map((option) => (
          <Pressable
            key={option.key}
            onPress={() => setType(option.value)}
            className={
              option.selected
                ? "rounded-full bg-brand px-4 py-2"
                : "rounded-full border border-border bg-surface px-4 py-2"
            }>
            <AppText
              variant="caption"
              className={option.selected ? "text-white" : undefined}>
              {option.label}
            </AppText>
          </Pressable>
        ))}
      </View>

      {error ? (
        <Card className="gap-3 border border-danger p-4">
          <AppText variant="heading" className="text-danger">
            Có lỗi xảy ra
          </AppText>
          <AppText variant="caption">{error}</AppText>
          <Button title="Thử lại" onPress={retry} />
        </Card>
      ) : null}

      {isLoading ? (
        <View className="items-center p-4">
          <ActivityIndicator color={brand.DEFAULT} />
        </View>
      ) : null}
    </View>
  );

  const empty = isEmpty ? (
    <Card className="items-center gap-2 p-5">
      <Ionicons name="chatbubbles-outline" size={28} color={brand.DEFAULT} />
      <AppText variant="heading">Chưa có phản hồi nào</AppText>
    </Card>
  ) : null;

  return (
    <ListScreen
      data={items}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) => <FeedbackCard item={item} />}
      header={header}
      empty={empty}
      onEndReached={() => void loadMore()}
      isLoadingMore={isLoadingMore}
    />
  );
}
