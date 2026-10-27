import { StatusScreen } from '@/components/feedback/StatusScreen';

export default function NotFoundScreen() {
  return <StatusScreen code="404" icon="search-outline" title="Không tìm thấy trang" message="Trang bạn tìm không tồn tại hoặc đã được chuyển đi." />;
}
