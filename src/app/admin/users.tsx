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
import { useAppTheme } from "@/core/theme/useAppTheme";
import {
  useAdminUsers,
  type AdminUserItem,
} from "@/features/admin/useAdminUsers";

function SearchBar({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  const { brand, palette } = useAppTheme();
  return (
    <View className="flex-row items-center gap-2 rounded-2xl border border-line bg-surface px-4 shadow-sm dark:border-line-dark">
      <Ionicons name="search" size={20} color={brand} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        className="flex-1 py-3 text-base text-ink dark:text-ink-dark"
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={10}
          accessibilityLabel="Xoá từ khoá">
          <Ionicons name="close-circle" size={20} color={palette.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

function UserCard({ user }: { user: AdminUserItem }) {
  const { brand, palette } = useAppTheme();
  // Xoay màu theo avatarSeed, lấy từ palette để đúng dark mode
  const tones = [brand, palette.successInk, palette.warnInk, palette.muted];
  const color = tones[user.avatarSeed % tones.length];

  return (
    <Card className="flex-row items-center gap-4 p-4 shadow-sm">
      <View
        className="h-14 w-14 items-center justify-center overflow-hidden rounded-full"
        style={{ backgroundColor: `${color}22` }}>
        {user.avatarUri ? (
          <Image
            source={{ uri: user.avatarUri }}
            className="h-14 w-14"
            resizeMode="cover"
          />
        ) : (
          <AppText variant="heading" style={{ color }}>
            {user.initial}
          </AppText>
        )}
      </View>

      <View className="flex-1 gap-1">
        <AppText variant="heading" className="text-base" numberOfLines={1}>
          {user.name}
        </AppText>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="mail-outline" size={14} color={palette.muted} />
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
      <View className="h-14 w-14 rounded-full bg-soft dark:bg-soft-dark" />
      <View className="flex-1 gap-2">
        <View className="h-4 w-1/2 rounded-md bg-soft dark:bg-soft-dark" />
        <View className="h-3 w-3/4 rounded-md bg-soft dark:bg-soft-dark" />
      </View>
    </Card>
  );
}

export default function AdminUsersScreen() {
  const router = useRouter();
  const { brand, palette } = useAppTheme();
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
          hitSlop={8}
          className="h-10 w-10 items-center justify-center rounded-full bg-soft active:scale-90 dark:bg-surface-dark">
          <Ionicons name="arrow-back" size={20} color={palette.ink} />
        </Pressable>

        <View className="flex-1">
          <AppText variant="title">Người dùng</AppText>
          <AppText variant="caption">Tài khoản trong hệ thống</AppText>
        </View>

        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brandSoft dark:bg-surface-dark">
          <Ionicons name="people" size={20} color={brand} />
        </View>
      </View>

      <SearchBar
        value={keyword}
        onChangeText={setKeyword}
        placeholder="Tìm theo tên hoặc email"
      />

      {countLabel ? (
        <View className="flex-row items-center justify-between px-1">
          <AppText
            variant="label"
            className="text-xs font-bold uppercase tracking-wider text-muted dark:text-muted-dark">
            {countLabel}
          </AppText>
          {isRefreshing ? (
            <ActivityIndicator size="small" color={brand} />
          ) : null}
        </View>
      ) : null}

      {error ? (
        <Card className="items-center gap-3 border border-dangerInk/40 bg-dangerBg/40 p-5 dark:border-dangerInk-dark/40 dark:bg-dangerBg-dark">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-surface dark:bg-soft-dark">
            <Ionicons name="alert-circle" size={28} color={palette.dangerInk} />
          </View>
          <AppText variant="heading" className="text-base">
            Có lỗi xảy ra
          </AppText>
          <AppText variant="caption" className="text-center">
            {error}
          </AppText>
          <Button
            title="Thử lại"
            variant="outline"
            onPress={retry}
            className="self-stretch"
          />
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
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brandSoft dark:bg-surface-dark">
        <Ionicons name="people-outline" size={30} color={brand} />
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
