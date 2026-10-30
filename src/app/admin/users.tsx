import {
  ActivityIndicator,
  Image,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListScreen } from "@/components/ui/ListScreen";
import { brand } from "@/core/theme/colors";
import {
  useAdminUsers,
  type AdminUserItem,
} from "@/features/admin/useAdminUsers";

const MUTED = "#9CA3AF";

// Class viết nguyên văn để NativeWind nhận diện. Mỗi người một màu theo avatarSeed.
const AVATAR_TONES = [
  {
    bg: "bg-emerald-100 dark:bg-emerald-900",
    text: "text-emerald-700 dark:text-emerald-200",
  },
  { bg: "bg-sky-100 dark:bg-sky-900", text: "text-sky-700 dark:text-sky-200" },
  {
    bg: "bg-violet-100 dark:bg-violet-900",
    text: "text-violet-700 dark:text-violet-200",
  },
  {
    bg: "bg-amber-100 dark:bg-amber-900",
    text: "text-amber-700 dark:text-amber-200",
  },
  {
    bg: "bg-rose-100 dark:bg-rose-900",
    text: "text-rose-700 dark:text-rose-200",
  },
  {
    bg: "bg-teal-100 dark:bg-teal-900",
    text: "text-teal-700 dark:text-teal-200",
  },
];

function SearchBar({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <View className="flex-row items-center gap-2 rounded-2xl border border-border bg-surface px-4">
      <Ionicons name="search-outline" size={20} color={brand.DEFAULT} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={MUTED}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        className="flex-1 py-3 text-base text-black dark:text-white"
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={10}
          accessibilityLabel="Xoá từ khoá">
          <Ionicons name="close-circle" size={20} color={MUTED} />
        </Pressable>
      ) : null}
    </View>
  );
}

function UserCard({ user }: { user: AdminUserItem }) {
  const tone = AVATAR_TONES[user.avatarSeed % AVATAR_TONES.length];

  return (
    <Card className="flex-row items-center gap-4 p-4">
      <View
        className={`h-14 w-14 items-center justify-center overflow-hidden rounded-full ${tone.bg}`}>
        {user.avatarUri ? (
          <Image
            source={{ uri: user.avatarUri }}
            className="h-14 w-14"
            resizeMode="cover"
          />
        ) : (
          <AppText variant="heading" className={tone.text}>
            {user.initial}
          </AppText>
        )}
      </View>

      <View className="flex-1 gap-1">
        <AppText variant="heading" numberOfLines={1}>
          {user.name}
        </AppText>
        <View className="flex-row items-center gap-1">
          <Ionicons name="mail-outline" size={14} color={MUTED} />
          <View className="flex-1">
            <AppText variant="caption" numberOfLines={1}>
              {user.email || "Chưa cập nhật email"}
            </AppText>
          </View>
        </View>
      </View>
    </Card>
  );
}

/** Khung chờ khi đang tải lần đầu. */
function UserSkeleton() {
  return (
    <Card className="flex-row items-center gap-4 p-4">
      <View className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-700" />
      <View className="flex-1 gap-2">
        <View className="h-4 w-1/2 rounded-md bg-slate-200 dark:bg-slate-700" />
        <View className="h-3 w-3/4 rounded-md bg-slate-200 dark:bg-slate-700" />
      </View>
    </Card>
  );
}

export default function AdminUsersScreen() {
  const router = useRouter();
  const {
    items,
    keyword,
    setKeyword,
    error,
    isInitialLoading,
    isRefreshing,
    isLoadingMore,
    isEmpty,
    countLabel,
    emptyHint,
    loadMore,
    retry,
  } = useAdminUsers();

  const header = (
    <View className="gap-4 pb-1">
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface">
          <Ionicons name="arrow-back" size={22} color={brand.DEFAULT} />
        </Pressable>

        <View className="flex-1">
          <AppText variant="title">Người dùng</AppText>
          <AppText variant="caption">Tài khoản trong hệ thống</AppText>
        </View>

        <View className="h-10 w-10 items-center justify-center rounded-full bg-brandSoft dark:bg-successBg-dark">
          <Ionicons name="people" size={20} color={brand.DEFAULT} />
        </View>
      </View>

      <SearchBar
        value={keyword}
        onChangeText={setKeyword}
        placeholder="Tìm theo tên hoặc email"
      />

      {countLabel ? (
        <View className="flex-row items-center justify-between px-1">
          <AppText variant="label">{countLabel}</AppText>
          {isRefreshing ? (
            <ActivityIndicator size="small" color={brand.DEFAULT} />
          ) : null}
        </View>
      ) : null}

      {error ? (
        <Card className="gap-3 border border-danger p-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <AppText variant="heading" className="text-danger">
              Có lỗi xảy ra
            </AppText>
          </View>
          <AppText variant="caption">{error}</AppText>
          <Button title="Thử lại" onPress={retry} />
        </Card>
      ) : null}

      {isInitialLoading ? (
        <View className="gap-3">
          <UserSkeleton />
          <UserSkeleton />
          <UserSkeleton />
          <UserSkeleton />
        </View>
      ) : null}
    </View>
  );

  const empty = isEmpty ? (
    <View className="items-center gap-3 px-6 py-10">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brandSoft dark:bg-successBg-dark">
        <Ionicons name="people-outline" size={30} color={brand.DEFAULT} />
      </View>
      <AppText variant="heading">Không có người dùng</AppText>
      <AppText variant="caption" className="text-center">
        {emptyHint}
      </AppText>
    </View>
  ) : null;

  return (
    <ListScreen
      data={items}
      keyExtractor={(user) => user.key}
      renderItem={({ item }) => <UserCard user={item} />}
      header={header}
      empty={empty}
      onEndReached={() => void loadMore()}
      isLoadingMore={isLoadingMore}
    />
  );
}
