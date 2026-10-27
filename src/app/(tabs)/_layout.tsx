import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useAppTheme } from '@/core/theme/useAppTheme';

// OCP: thêm/sửa tab chỉ cần sửa danh sách này.
const TAB_ITEMS: { name: string; title: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'pantry', title: 'Tủ', icon: 'briefcase-outline' },
  { name: 'search', title: 'Tìm món', icon: 'search-outline' },
  { name: 'saved', title: 'Đã lưu', icon: 'bookmark-outline' },
  { name: 'meal-plan', title: 'Thực đơn', icon: 'calendar-outline' },
  { name: 'more', title: 'Thêm', icon: 'ellipsis-horizontal' },
];

export default function TabsLayout() {
  const { palette, brand } = useAppTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: brand,
        tabBarInactiveTintColor: palette.muted,
        tabBarLabelStyle: { fontWeight: '600', fontSize: 12 },
        tabBarStyle: { backgroundColor: palette.canvas, borderTopColor: palette.line },
      }}
    >
      {TAB_ITEMS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{ title: t.title, tabBarIcon: ({ color, size }) => <Ionicons name={t.icon} size={size} color={color} /> }}
        />
      ))}
    </Tabs>
  );
}
