import { useRouter, type Href } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { MenuGroup, type MenuItem } from '@/components/ui/MenuGroup';
import { Screen } from '@/components/ui/Screen';

const ACTIONS: MenuItem[] = [
  { icon: 'add-circle-outline', title: 'Thêm món vào thực đơn', route: 'meal-plan/add-entry' },
  { icon: 'cart-outline', title: 'Xem trước danh sách mua sắm', route: 'meal-plan/shopping-preview' },
  { icon: 'sparkles-outline', title: 'Tạo thực đơn bằng AI', route: 'ai/meal-plan' },
];

export default function MealPlanHub() {
  const router = useRouter();
  return (
    <Screen>
      <AppText variant="title">Thực đơn</AppText>
      <AppText variant="caption">Lịch tuần sẽ được thiết kế chi tiết ở bước sau.</AppText>
      <MenuGroup items={ACTIONS} onNavigate={(r) => router.push(`/${r}` as Href)} />
    </Screen>
  );
}
