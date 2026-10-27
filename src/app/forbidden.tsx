import { StatusScreen } from '@/components/feedback/StatusScreen';

export default function ForbiddenScreen() {
  return <StatusScreen code="403" icon="lock-closed-outline" title="Không có quyền truy cập" message="Bạn không được phép xem nội dung này. Hãy thử đăng nhập lại hoặc liên hệ hỗ trợ." />;
}
