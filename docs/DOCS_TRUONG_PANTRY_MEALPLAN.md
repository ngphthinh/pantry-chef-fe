# TÀI LIỆU KỸ THUẬT & HƯỚNG DẪN TRIỂN KHAI: PANTRY + MEAL PLAN
**Thành viên phụ trách:** Trường (Mục 3.3 trong `PHAN_CONG_CHI_TIET.md`)  
**Dự án:** PantryChef Mobile App (`pantry-chef-fe`)  
**Công nghệ:** React Native, Expo Router, Redux Toolkit, Clean Architecture, TypeScript, NativeWind / StyleSheet 3D Aesthetics.

---

## MỤC LỤC
1. [Tổng quan nhiệm vụ & Trạng thái hoàn thành](#1-tổng-quan-nhiệm-vụ--trạng-thái-hoàn-thành)
2. [Kiến trúc Clean Architecture & Cấu hình kết nối](#2-kiến-trúc-clean-architecture--cấu-hình-kết-nối)
3. [Danh mục 18 Endpoints Backend kết nối thực tế](#3-danh-mục-18-endpoints-backend-kết-nối-thực-tế)
4. [Đặc tả chi tiết 9 Màn hình giao diện 3D trực quan](#4-đặc-tả-chi-tiết-9-màn-hình-giao-diện-3d-trực-quan)
5. [Quy chuẩn tính toán độ tươi & Validation nghiệp vụ](#5-quy-chuẩn-tính-toán-độ-tươi--validation-nghiệp-vụ)
6. [Hệ thống chọn ngày từ Lịch & Ràng buộc thời gian](#6-hệ-thống-chọn-ngày-từ-lịch--ràng-buộc-thời-gian)
7. [Giao tiếp liên module (Cung cấp cho Tùng & Việt)](#7-giao-tiếp-liên-module-cung-cấp-cho-tùng--việt)
8. [Hướng dẫn kiểm thử, Typecheck & Chạy ứng dụng](#8-hướng-dẫn-kiểm-thử-typecheck--chạy-ứng-dụng)

---

## 1. TỔNG QUAN NHIỆM VỤ & TRẠNG THÁI HOÀN THÀNH

| Hạng mục | Yêu cầu cam kết | Đã hoàn thành | Trạng thái |
|---|---|---|---|
| **Pantry Endpoints** | 9 endpoint API | 9/9 endpoint kết nối backend thực tế | **100% COMPLETE** |
| **Meal Plan Endpoints** | 9 endpoint API | 9/9 endpoint kết nối backend thực tế | **100% COMPLETE** |
| **Màn hình giao diện** | 9 màn hình 3D hiện đại | 9/9 màn hình hoàn chỉnh, responsive | **100% COMPLETE** |
| **Tính nhãn độ tươi** | Tính trong hook, không tính ở UI | `calculateFreshness()` trong `usePantry.ts` | **100% COMPLETE** |
| **Cung cấp cho Tùng** | Hook `usePantry` để lọc món | Hoàn tất export đầy đủ dữ liệu | **100% COMPLETE** |
| **Cung cấp cho Việt** | Endpoint `GET /expiring` | Hoàn tất API & Redux Thunk | **100% COMPLETE** |
| **Chọn lịch & Ràng buộc** | Chọn từ lịch, chặn ngày quá khứ | Tích hợp `DatePickerModal` trên toàn bộ app | **100% COMPLETE** |
| **Sao chép thực đơn tuần** | Chọn nhanh + Modal lịch + chặn quá khứ | Hoàn tất trên Tab Meal Plan | **100% COMPLETE** |
| **Chất lượng mã nguồn** | Không dùng mock data tĩnh, TypeScript | `npm run typecheck` 0 errors | **100% COMPLETE** |

---

## 2. KIẾN TRÚC CLEAN ARCHITECTURE & CẤU HÌNH KẾT NỐI

Dự án tuân thủ nghiêm ngặt mô hình phân tầng **Clean Architecture**, đảm bảo tính độc lập và khả năng bảo trì cao:

```
UI Layer (Screen Components - React Native / Expo Router)
   │  (Chỉ tương tác qua custom hooks, nhận dữ liệu & trigger action)
   ▼
Presentation Hooks (`usePantry`, `usePantryForm`, `useMealPlan`, `useMealPlanEntryForm`)
   │  (Xử lý state giao diện, tính toán nhãn độ tươi, validation form)
   ▼
State Management (`pantrySlice`, `mealPlanSlice` - Redux Toolkit Thunks)
   │  (Quản lý trạng thái toàn cục, caching, loading, error)
   ▼
Business Logic Services (`PantryService`, `MealPlanService`, `ShoppingService`)
   │  (Chứa quy tắc nghiệp vụ ứng dụng, độc lập với UI framework)
   ▼
Repository Layer (`HttpPantryRepository`, `HttpMealPlanRepository`, `HttpShoppingRepository`)
   │  (Giao tiếp trực tiếp với Backend API qua Axios Instance)
   ▼
Core Infrastructure (`httpClient.ts`, `secureTokenStorage.ts`, `container.ts`)
```

### 2.1 Cấu hình Axios & Authentication Interceptor
- **Base URL:** Cấu hình thông qua `EXPO_PUBLIC_API_URL` (mặc định `http://<backend-ip>:8080/api`).
- **Auth Interceptor:** Tự động gắn header `Authorization: Bearer <accessToken>` từ `secureTokenStorage.ts` cho mọi request.
- **Xử lý PostgreSQL Hibernate `lower(bytea)`:**
  Khi truy vấn tìm kiếm món `GET /v1/pantry-items`, nếu `keyword` là `undefined` hoặc `null`, Hibernate gán `JAVA_OBJECT` khiến Postgres ép kiểu sang `bytea` và gây lỗi `lower(bytea) does not exist`. 
  -> **Giải pháp đã xử lý triệt để:** `HttpPantryRepository` luôn chuẩn hoá `keyword: query.keyword ?? ''` trước khi gửi request.

### 2.2 Dependency Injection Container (`src/core/di/container.ts`)
Toàn bộ repository và service được đăng ký tập trung:
- `pantryRepository` -> `pantryService`
- `mealPlanRepository` -> `mealPlanService`
- `shoppingRepository` -> `shoppingService`

---

## 3. DANH MỤC 18 ENDPOINTS BACKEND KẾT NỐI THỰC TẾ

### 3.1 Nhóm Pantry (9 Endpoints)
| STT | Phương thức | Đường dẫn API | Chức năng | Code xử lý |
|:---:|:---:|---|---|---|
| 1 | `GET` | `/v1/pantry-items` | Lấy danh sách tủ theo cursor, keyword, category, location | `HttpPantryRepository.getMyItems` |
| 2 | `POST` | `/v1/pantry-items` | Thêm mới 1 nguyên liệu thủ công | `HttpPantryRepository.create` |
| 3 | `POST` | `/v1/pantry-items/batch` | Thêm hàng loạt nguyên liệu từ quét AI | `HttpPantryRepository.createBatch` |
| 4 | `GET` | `/v1/pantry-items/{id}` | Lấy chi tiết 1 món theo UUID | `HttpPantryRepository.getById` |
| 5 | `PUT` | `/v1/pantry-items/{id}` | Cập nhật số lượng, hạn dùng, vị trí bảo quản | `HttpPantryRepository.update` |
| 6 | `DELETE` | `/v1/pantry-items/{id}` | Xoá nguyên liệu khỏi tủ đồ | `HttpPantryRepository.remove` |
| 7 | `POST` | `/v1/pantry-items/{id}/consume` | Dùng bớt số lượng nguyên liệu trong tủ | `HttpPantryRepository.consume` |
| 8 | `POST` | `/v1/pantry-items/{id}/photo` | Upload ảnh chụp nguyên liệu (`multipart/form-data`) | `HttpPantryRepository.uploadPhoto` |
| 9 | `GET` | `/v1/pantry-items/expiring` | Lấy danh sách các món sắp hết hạn (ngưỡng số ngày) | `HttpPantryRepository.getExpiring` |

### 3.2 Nhóm Meal Plan (9 Endpoints)
| STT | Phương thức | Đường dẫn API | Chức năng | Code xử lý |
|:---:|:---:|---|---|---|
| 10 | `GET` | `/v1/meal-plans?weekStart=` | Lấy kế hoạch bữa ăn theo tuần (Thứ 2 đầu tuần) | `HttpMealPlanRepository.getByWeek` |
| 11 | `POST` | `/v1/meal-plans` | Tạo mới kế hoạch tuần | `HttpMealPlanRepository.create` |
| 12 | `GET` | `/v1/meal-plans/{id}` | Lấy chi tiết thực đơn theo ID | `HttpMealPlanRepository.getById` |
| 13 | `DELETE` | `/v1/meal-plans/{id}` | Xoá thực đơn tuần | `HttpMealPlanRepository.remove` |
| 14 | `POST` | `/v1/meal-plans/{id}/copy` | Sao chép toàn bộ bữa ăn sang tuần mới (`targetWeekStart`) | `HttpMealPlanRepository.copyWeek` |
| 15 | `POST` | `/v1/meal-plans/{id}/entries` | Thêm bữa ăn vào ngày (`BREAKFAST`, `LUNCH`, `DINNER`) | `HttpMealPlanRepository.addEntry` |
| 16 | `PATCH` | `/v1/meal-plans/{id}/entries/{entryId}` | Sửa bữa ăn hoặc cập nhật trạng thái đã nấu (`cooked`) | `HttpMealPlanRepository.updateEntry` |
| 17 | `DELETE` | `/v1/meal-plans/{id}/entries/{entryId}` | Xoá 1 bữa ăn khỏi thực đơn | `HttpMealPlanRepository.removeEntry` |
| 18 | `GET` | `/v1/meal-plans/{id}/shopping-list` | Lấy danh sách nguyên liệu thiếu cần mua cho thực đơn | `HttpMealPlanRepository.getShoppingList` |

### 3.3 Endpoints Tích hợp liên kết (AI & Shopping)
- `POST /v1/ai/meal-plan`: Nhận prompt sở thích, calo -> sinh thực đơn tuần AI gợi ý (Tích hợp AI Thịnh).
- `POST /v1/shopping-lists`: Lưu danh sách nguyên liệu thiếu thành danh sách mua sắm chính thức (Tích hợp Thiệu).

---

## 4. ĐẶC TẢ CHI TIẾT 9 MÀN HÌNH GIAO DIỆN 3D TRỰC QUAN

Tất cả 9 màn hình đều được đăng ký route bảo vệ trong `src/app/_layout.tsx` (`<Stack.Protected guard={isAuthed}>`).

### Màn hình 1: Trang tab Tủ đồ (`src/app/(tabs)/pantry.tsx`)
- **Tích hợp toàn diện `GET /v1/pantry-items?cursor=&size=&categoryId=&location=&keyword=`**:
  - **Thanh tìm kiếm realtime:** Ô input tìm kiếm 3D hiện đại có icon kính lúp, nút xoá từ khoá nhanh, tích hợp **Debounce 400ms** tự động gọi API `keyword`.
  - **Lọc theo vị trí bảo quản (Storage Location):** Các chip bấm trực tiếp `Tất cả`, `Tủ mát ❄️ (FRIDGE)`, `Tủ đông 🧊 (FREEZER)`, `Kệ bếp 🥫 (PANTRY_SHELF)` gửi query param `location` lên server.
  - **Lọc theo danh mục thực phẩm:** Các chip lọc `categoryId` linh hoạt.
  - **Phân trang theo con trỏ (Cursor-based Pagination):** Nhận `hasNext` và `nextCursor` từ `CursorResponse<PantryItemResponse>`. Khi còn dữ liệu, hiển thị nút *"Tải thêm nguyên liệu..."* gọi `loadMore()` với cờ `append = true`.
- **Thống kê & Banner cảnh báo:**
  - Thẻ thống kê tổng số món, banner cảnh báo "Sắp hết hạn" nổi bật với tông màu cam/đỏ.
  - Hiển thị phản hồi kết quả tìm kiếm (*"Tìm thấy X món cho '...'"*) kèm nút *"Đặt lại ✕"*.
  - Empty state thông minh khi không tìm thấy nguyên liệu.
- **Menu nổi FAB 3D (Floating Action Button):**
  - Quét mã vạch nguyên liệu (chuyển sang scanner của Việt).
  - Quét ảnh tủ lạnh bằng AI (chuyển sang AI camera của Thịnh).
  - Thêm thủ công (chuyển sang `pantry/new`).

### Màn hình 2: Chi tiết nguyên liệu (`src/app/pantry/[id].tsx`)
- **Card 3D trung tâm:** Hiển thị ảnh chụp thực phẩm (hoặc icon 3D placeholder), nhãn độ tươi, vị trí bảo quản, số lượng hiện có, hạn sử dụng.
- **Thao tác nhanh:**
  - **Dùng bớt nguyên liệu (`consume`):** Modal nhập lượng sử dụng có validate không vượt quá lượng hiện có.
  - **Chỉnh sửa:** Cập nhật số lượng, vị trí, hạn sử dụng (chọn từ Modal Lịch `DatePickerModal`).
  - **Upload ảnh thực tế:** Tích hợp `expo-image-picker` tải ảnh từ thư viện lên máy chủ.
  - **Xoá nguyên liệu:** Hộp thoại cảnh báo bảo vệ trước khi xoá.

### Màn hình 3: Thêm nguyên liệu thủ công (`src/app/pantry/new.tsx`)
- **Tích hợp liên màn hình:** Tự động nhận `ingredientId`, `ingredientName`, `defaultUnit` nếu được truyền từ màn hình chọn danh mục (`select-ingredient`) hoặc từ máy quét mã vạch.
- **Bộ chọn trực quan:**
  - Bộ chọn vị trí bảo quản 3D (Tủ mát, Tủ đông, Kệ bếp).
  - Bộ chọn đơn vị đo lường linh hoạt (`G`, `KG`, `ML`, `L`, `PCS`, `TBSP`, `TSP`, `CUP`).
  - **Hạn sử dụng:** Chạm để mở `DatePickerModal`, có các nút chọn nhanh `+3 ngày`, `+1 tuần`, `+2 tuần`, `+1 tháng`.

### Màn hình 4: Kiểm tra quét ảnh AI (`src/app/pantry/scan-review.tsx`)
- **Xử lý dữ liệu AI:** Nhận danh sách nguyên liệu AI nhận diện được từ màn hình chụp ảnh của Thịnh.
- **Giao diện tương tác:**
  - Hiển thị độ tin cậy nhận diện (%) của từng món.
  - Bộ điều khiển tăng/giảm số lượng (+ / -) trực tiếp.
  - Cho phép loại bỏ các món nhận diện sai trước khi lưu.
- **Lưu hàng loạt:** Gọi `POST /v1/pantry-items/batch` chỉ với 1 chạm.

### Màn hình 5: Danh sách sắp hết hạn (`src/app/pantry/expiring.tsx`)
- **Lọc theo cấp độ khẩn cấp:** `Tất cả`, `Hôm nay (0 ngày)`, `Còn 1 ngày`, `Còn 2 ngày`, `Còn 3 ngày`.
- **Card cảnh báo 3D:** Hiển thị số ngày còn lại với badge màu nổi bật (`Hết hạn` - Đỏ, `Còn 1-2 ngày` - Cam, `Còn tươi` - Xanh).
- **Hành động nhanh:** Nút "Dùng ngay" (tiêu thụ nhanh) hoặc chạm để xem chi tiết.

### Màn hình 6: Trang tab Thực đơn (`src/app/(tabs)/meal-plan.tsx`)
- **Điều hướng tuần đa năng:**
  - Bấm `<` `>` để lùi/tiến tuần.
  - **Chạm vào giữa:** Mở `DatePickerModal` chuyên biệt để tự do chọn bất kỳ tuần nào từ popup lịch.
  - Nút chip **"Hôm nay"** giúp nhảy ngay về tuần hiện tại chỉ với 1 chạm.
- **Dải 7 ngày tương tác (7-Day Strip):** Chạm vào từng thứ trong tuần để hiển thị chi tiết các bữa ăn ngày đó.
- **Danh sách bữa ăn (Sáng / Trưa / Tối):**
  - Checkbox đánh dấu món "Đã nấu" (`cooked`) với hiệu ứng gạch ngang trực quan.
  - Nút thêm món mới cho từng bữa.
  - Nút xoá từng bữa ăn khỏi kế hoạch.
- **Nút "Sao chép tuần" nổi bật:** Mở modal sao chép với các tùy chọn chọn nhanh tuần kế tiếp.

### Màn hình 7: Thêm bữa ăn vào thực đơn (`src/app/meal-plan/add-entry.tsx`)
- **Lựa chọn bữa ăn:** `Bữa sáng ☀️`, `Bữa trưa 🌤️`, `Bữa tối 🌙`.
- **Thông tin món ăn:** Nhập tên món ăn, chọn ngày trong tuần, số lượng khẩu phần ăn (stepper tăng giảm), ghi chú món ăn.
- **Auto-create Plan:** Nếu tuần đó chưa có thực đơn, hệ thống tự động tạo bản ghi kế hoạch tuần trước khi thêm bữa ăn.

### Màn hình 8: Xem trước nguyên liệu cần mua (`src/app/meal-plan/shopping-preview.tsx`)
- **Thuật toán đối soát thông minh:** Gọi API backend để so sánh nguyên liệu trong thực đơn tuần với nguyên liệu đang có sẵn trong tủ lạnh.
- **Danh sách thiếu hụt:** Hiển thị chi tiết các nguyên liệu còn thiếu cần phải mua kèm số lượng.
- **Lưu thành danh sách mua sắm:** Nút bấm tích hợp trực tiếp gọi API của Thiệu để tạo danh sách mua sắm chính thức.

### Màn hình 9: Thực đơn thông minh AI gợi ý (`src/app/ai/meal-plan.tsx`)
- **Nhập tiêu chí:** Mục tiêu calo mỗi ngày, số người ăn, chế độ ăn kiêng (`Mọi món`, `Eat Clean`, `Keto`, `Thuần chay`).
- **Sinh thực đơn:** Gọi API AI của Thịnh (`POST /v1/ai/meal-plan`), hiển thị màn hình chờ loading trực quan.
- **Xem trước và áp dụng:** Xem bản nháp 7 ngày đầy đủ các bữa, bấm "Lưu vào thực đơn tuần" để tự động ghi đè hoặc bổ sung vào kế hoạch tuần.

---

## 5. QUY CHUẨN TÍNH TOÁN ĐỘ TƯƠI & VALIDATION NGHIỆP VỤ

### 5.1 Quy tắc nghiệp vụ bắt buộc: Tính nhãn độ tươi TRONG HOOK
Quy định trong đề bài: **"Nhãn 'Còn tươi / Còn 2 ngày / Hết hạn' tính trong hook, không tính ở giao diện"**.

Logic đã được đóng gói hoàn toàn trong hàm `calculateFreshness(expiryDate)` tại `src/features/pantry/usePantry.ts`:
```typescript
export function calculateFreshness(expiryDate?: string | null): FreshnessInfo {
  if (!expiryDate) {
    return { status: 'fresh', daysLeft: 999, label: 'Còn tươi' };
  }

  const [y, m, d] = expiryDate.split('-').map(Number);
  const expiry = new Date(y, m - 1, d, 23, 59, 59);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { status: 'expired', daysLeft, label: 'Hết hạn' };
  }
  if (daysLeft === 0) {
    return { status: 'soon', daysLeft: 0, label: 'Hết hạn hôm nay' };
  }
  if (daysLeft <= 2) {
    return { status: 'soon', daysLeft, label: `Còn ${daysLeft} ngày` };
  }
  if (daysLeft <= 7) {
    return { status: 'soon', daysLeft, label: `Còn ${daysLeft} ngày` };
  }
  return { status: 'fresh', daysLeft, label: 'Còn tươi' };
}
```
Giao diện chỉ việc hiển thị thuộc tính `.label` và màu sắc từ `.status`, hoàn toàn không tự tính toán ngày tháng.

### 5.2 Xử lý chống lệch ngày do múi giờ UTC (Timezone Safe)
Việc sử dụng `d.toISOString().split('T')[0]` trên các hệ thống múi giờ GMT+7 thường xuyên làm ngày bị lùi về 17:00 ngày hôm trước (lệch mất 1 ngày).
-> **Quy chuẩn áp dụng:** Luôn dùng hàm `formatLocalDate(date: Date)` và khởi tạo giờ tại `12:00:00` trưa:
```typescript
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
```

---

## 6. HỆ THỐNG CHỌN NGÀY TỪ LỊCH & RÀNG BUỘC THỜI GIAN

### 6.1 Component Lịch Popup chuyên biệt (`src/components/ui/DatePickerModal.tsx`)
- Được xây dựng bằng `StyleSheet` và `useAppTheme` chuẩn mực, tránh xung đột CSS variable của NativeWind.
- Hỗ trợ đầy đủ chế độ Light / Dark Mode với bóng đổ 3D sắc nét.
- **Khả năng linh hoạt của `minDate`:**
  - `minDate = new Date()`: Tự động vô hiệu hoá toàn bộ các ngày trước ngày hiện tại (áp dụng cho Hạn sử dụng tủ và Sao chép thực đơn tuần).
  - `minDate = null`: Cho phép chọn ngày tự do cả quá khứ và tương lai (áp dụng cho Xem thực đơn theo tuần).
- Tích hợp các nút chọn nhanh presets: `+3 ngày`, `+1 tuần`, `+2 tuần`, `+1 tháng`.

### 6.2 Sao chép thực đơn tuần không cho phép sao chép sang quá khứ
- **Quick Presets:** Cung cấp 4 tuần kế tiếp trong tương lai: `Tuần sau`, `Sau 2 tuần`, `Sau 3 tuần`, `Sau 4 tuần`. Mở modal là tự động chọn sẵn Tuần kế tiếp.
- **Ràng buộc kiểm tra 2 lớp:**
  1. *Lớp giao diện:* Nếu `targetWeekStart < currentMonday`, hiển thị cảnh báo đỏ và vô hiệu hoá nút "Xác nhận chép". Nếu `targetWeekStart === selectedWeekStart`, cảnh báo vàng trùng tuần.
  2. *Lớp logic (`handleCopyWeek`):* Chặn và thông báo alert nếu người dùng cố tình nhập tay ngày trong quá khứ.
- **Cơ chế chống lỗi lồng Modal:** Áp dụng luồng đóng/mở tuần tự khi chuyển từ modal sao chép sang popup lịch và ngược lại, bảo đảm không bị crash hoặc kẹt touch event trên mobile.

---

## 7. GIAO TIẾP LIÊN MODULE (CUNG CẤP CHO TÙNG & VIỆT)

### 7.1 Cung cấp cho Tùng: Hook `usePantry` (Lọc món ăn theo nguyên liệu có sẵn)
Tùng có thể import trực tiếp hook `usePantry` để lấy danh sách nguyên liệu người dùng đang có trong tủ:
```typescript
import { usePantry } from '@/features/pantry/usePantry';

export function CookingSuggestionScreen() {
  const { items, freshItems, loadItems } = usePantry();

  useEffect(() => {
    loadItems(); // Tải danh sách nguyên liệu mới nhất từ backend
  }, [loadItems]);

  // `items` chứa toàn bộ nguyên liệu kèm số lượng và đơn vị
  // `freshItems` chứa các nguyên liệu còn hạn sử dụng (fresh hoặc soon)
  const availableIngredientIds = freshItems.map(item => item.ingredientId);
  ...
}
```

### 7.2 Cung cấp cho Việt: Endpoint `GET /v1/pantry-items/expiring` (Hệ thống thông báo)
Việt có thể gọi trực tiếp thông qua Redux Thunk hoặc repository:
```typescript
import { fetchExpiringItems } from '@/features/pantry/pantrySlice';
import { pantryService } from '@/core/di/container';

// Cách 1: Qua Redux Thunk
dispatch(fetchExpiringItems(3)); // Lấy các món hết hạn trong vòng 3 ngày tới

// Cách 2: Gọi trực tiếp qua Service để hiển thị Local Notification / Badge
const expiringItems = await pantryService.getExpiringItems(2);
if (expiringItems.length > 0) {
  // Bắn thông báo nhắc nhở người dùng
}
```

---

## 8. HƯỚNG DẪN KIỂM THỬ, TYPECHECK & CHẠY ỨNG DỤNG

### 8.1 Kiểm tra toàn vẹn TypeScript
Trước khi commit hoặc bàn giao, chạy lệnh sau tại thư mục gốc `e:\pantry-chef-fe`:
```bash
npm run typecheck
```
*Kết quả:* Mã thoát `code 0` (0 errors).

### 8.2 Chạy môi trường phát triển (Expo Dev Server)
```bash
npm run start
```
- Quét mã QR bằng ứng dụng **Expo Go** trên thiết bị iOS hoặc Android.
- Nhấn `a` để chạy trên Android Emulator hoặc `i` để chạy trên iOS Simulator.

### 8.3 Kịch bản kiểm thử luồng nghiệp vụ (Demo Flow)
1. **Kiểm tra Tủ đồ:**
   - Mở Tab "Tủ đồ" -> Kiểm tra danh sách hiển thị từ API backend.
   - Thử lọc theo "Tủ đông", "Tủ mát", "Kệ bếp" -> Danh sách phản hồi tức thì.
   - Bấm vào một món bất kỳ -> Xem màn hình chi tiết `pantry/[id]`.
   - Bấm "Dùng bớt nguyên liệu" -> Nhập số lượng và xác nhận -> Số lượng được cập nhật ngay.
   - Bấm "Chỉnh sửa" -> Thử chọn hạn sử dụng từ lịch (các ngày trước hôm nay bị mờ không chọn được).
2. **Kiểm tra Kế hoạch bữa ăn:**
   - Mở Tab "Thực đơn" -> Chạm vào giữa thanh điều hướng tuần -> Popup lịch mở lên -> Chọn 1 ngày bất kỳ -> Màn hình tự động nhảy đến đúng tuần đó.
   - Bấm "Sao chép tuần" -> Kiểm tra danh sách chọn nhanh tuần kế tiếp.
   - Bấm "Chọn ngày từ lịch" -> Chọn ngày -> Xác nhận chép thực đơn.
   - Đánh dấu tích vào bữa ăn -> Trạng thái đổi sang "Đã nấu".
   - Bấm "Mua sắm" -> Xem danh sách nguyên liệu thiếu được backend tự động tính toán.
   - Bấm "AI gợi ý" -> Nhập tiêu chí và tạo thực đơn AI.

---
**Tài liệu được biên soạn và xác nhận hoàn tất 100% nhiệm vụ của Trường.**
