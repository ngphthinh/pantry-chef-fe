import { Alert, Image, Pressable, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { MenuGroup, type MenuItem } from "@/components/ui/MenuGroup";
import { Screen } from "@/components/ui/Screen";
import { Ionicons } from "@expo/vector-icons";
import { brand } from "@/core/theme/colors";
import { useAdminAccess } from "@/features/admin/useAdminAccess";
import { confirmAction, notify } from "@/core/ui/dialogs";
import { useMoreMenu } from "@/features/more/useMoreMenu";

interface Section {
  title: string;
  items: MenuItem[];
}

const SECTIONS: Section[] = [
  {
    title: "Mua sắm",
    items: [
      {
        icon: "cart-outline",
        title: "Danh sách mua sắm",
        route: "shopping",
      },
    ],
  },
  {
    title: "Công thức của tôi",
    items: [
      {
        icon: "create-outline",
        title: "Món tự tạo",
        route: "recipe/custom",
      },
      {
        icon: "folder-outline",
        title: "Bộ sưu tập",
        route: "collection",
      },
    ],
  },
  {
    title: "Trợ lý AI",
    items: [
      {
        icon: "sparkles-outline",
        title: "Ý tưởng món từ tủ",
        route: "ai/ideas",
      },
      {
        icon: "swap-horizontal-outline",
        title: "Nguyên liệu thay thế",
        route: "ai/substitutions",
      },
      {
        icon: "calendar-outline",
        title: "Tạo thực đơn bằng AI",
        route: "ai/meal-plan",
      },
    ],
  },
  {
    title: "Cài đặt",
    items: [
      {
        icon: "contrast-outline",
        title: "Giao diện sáng / tối / hệ thống, hệ đo",
        route: "settings/preferences",
      },
      {
        icon: "notifications-outline",
        title: "Thông báo nhắc hết hạn",
        route: "settings/notifications",
      },
      {
        icon: "ban-outline",
        title: "Nguyên liệu loại trừ",
        route: "settings/excluded-ingredients",
      },
      {
        icon: "lock-closed-outline",
        title: "Đổi mật khẩu",
        route: "settings/change-password",
      },
    ],
  },
  {
    title: "Tiện ích",
    items: [
      {
        icon: "stats-chart-outline",
        title: "Thống kê của tôi",
        route: "settings/stats",
      },
      {
        icon: "swap-horizontal-outline",
        title: "Quy đổi đơn vị",
        route: "settings/unit-converter",
      },
      {
        icon: "chatbubble-outline",
        title: "Gửi phản hồi",
        route: "settings/feedback",
      },
      {
        icon: "information-circle-outline",
        title: "Giới thiệu, quyền riêng tư",
        route: "settings/about",
      },
    ],
  },
];

/** Chỉ hiện với admin. Các màn hình này còn được chặn thêm ở app/admin/_layout.tsx. */
const ADMIN_SECTION: Section = {
  title: "Quản trị",
  items: [
    {
      icon: "people-outline",
      title: "Quản lý người dùng",
      route: "admin/users",
    },
    {
      icon: "chatbubbles-outline",
      title: "Phản hồi từ người dùng",
      route: "admin/feedback",
    },
  ],
};

export default function MoreHub() {
  const router = useRouter();
  const { isAdmin } = useAdminAccess();
  const { profile, signOut, deleteAccount } = useMoreMenu();
  const go = (route: string) => router.push(`/${route}` as Href);

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.ok) notify("Lỗi", result.message);
  };

  const handleDeleteAccount = async () => {
    const ok = await confirmAction({
      title: "Xóa tài khoản",
      message:
        "Bạn có chắc chắn muốn xóa tài khoản? Hành động này có thể không thể hoàn tác.",
      confirmText: "Xóa tài khoản",
      destructive: true,
    });
    if (!ok) return;
    const result = await deleteAccount();
    if (!result.ok) notify("Lỗi", result.message);
  };

  const account: MenuItem[] = [
    {
      icon: "log-out-outline",
      title: "Đăng xuất",
      route: "POST /auth/logout",
      tone: "danger",
      onPress: () => void handleSignOut(),
    },
    {
      icon: "warning-outline",
      title: "Xóa tài khoản",
      route: "settings/delete-account",
      tone: "danger",
      onPress: () => void handleDeleteAccount(),
    },
  ];

  const sections = isAdmin ? [...SECTIONS, ADMIN_SECTION] : SECTIONS;

  return (
    <Screen>
      <AppText variant="title">Thêm</AppText>

      <Pressable onPress={() => go("settings/profile")}>
        <Card className="flex-row items-center gap-4 rounded-2xl border border-border bg-surface p-4">
          {/* Avatar */}
          <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-brandSoft dark:bg-successBg-dark">
            {profile?.avatarUri ? (
              <Image
                source={{ uri: profile.avatarUri }}
                className="h-14 w-14"
                resizeMode="cover"
              />
            ) : (
              <AppText variant="heading" className="text-brand">
                {profile?.initial?.trim()?.charAt(0)?.toUpperCase() ?? "?"}
              </AppText>
            )}
          </View>

          {/* User information */}
          <View className="flex-1 gap-1">
            <AppText variant="heading" numberOfLines={1}>
              {profile?.name?.trim() || "Người dùng"}
            </AppText>

            <AppText variant="caption" numberOfLines={1}>
              {profile?.email || "Chưa cập nhật email"}
            </AppText>

            <AppText variant="caption" className="text-brand">
              Xem hồ sơ cá nhân
            </AppText>
          </View>

          {/* Navigation indicator */}
          <View className="items-center justify-center">
            <Ionicons name="chevron-forward" size={20} color={brand.DEFAULT} />
          </View>
        </Card>
      </Pressable>
      {sections.map((s) => (
        <MenuGroup
          key={s.title}
          title={s.title}
          items={s.items}
          onNavigate={go}
        />
      ))}
      <MenuGroup title="Tài khoản" items={account} onNavigate={go} />
    </Screen>
  );
}
