# BÁO CÁO VÀ KỊCH BẢN THUYẾT TRÌNH DEMO — TRƯỜNG (3.3 PANTRY + MEAL PLAN)

> **Dự án**: Pantry Chef Mobile App (React Native, Expo, Redux Toolkit, NativeWind)  
> **Người thực hiện**: **Trường**  
> **Phạm vi phân công**: Mục **3.3 — Pantry (Tủ đồ) + Meal Plan (Thực đơn tuần)**  

---

## 1. TỔNG QUAN KẾT QUẢ ĐÃ HOÀN THÀNH

| Hạng mục | Chỉ tiêu phân công | Kết quả thực tế | Trạng thái |
|---|---|---|---|
| **Endpoint Pantry** | 9 endpoints | 9/9 endpoints chuẩn hóa | Hoàn thành 100% |
| **Endpoint Meal Plan** | 9 endpoints | 9/9 endpoints chuẩn hóa | Hoàn thành 100% |
| **Endpoint AI / Shopping** | Tích hợp AI draft & Shopping list | Đã tích hợp đầy đủ | Hoàn thành 100% |
| **Màn hình giao diện** | 9 màn hình | 9/9 màn hình 3D trực quan | Hoàn thành 100% |
| **Cung cấp cho team** | `usePantry` (Tùng), `GET /expiring` (Việt) | Sẵn sàng xuất khẩu (Export) | Hoàn thành 100% |
| **Tài liệu chuẩn hóa UI** | Quy chuẩn layout 3D | [README_UI.md](file:///e:/pantry-chef-fe/README_UI.md) | Đã phát hành |
| **Kiểm tra TypeScript** | `npm run typecheck` | 0 lỗi (Zero Errors) | Đạt chuẩn |

---

## 2. DANH SÁCH 18 ENDPOINTS ĐÃ HIỆN THỰC

### 2.1. Nhóm Pantry (9 Endpoints)
1. `GET /v1/pantry-items`: Lấy danh sách nguyên liệu có phân trang cursor, hỗ trợ lọc theo `categoryId`, `location`, `keyword`.
2. `POST /v1/pantry-items`: Thêm 1 nguyên liệu vào tủ (`ingredientId`, `quantity`, `unit`, `location`, `expiryDate`).
3. `POST /v1/pantry-items/batch`: Thêm nhiều nguyên liệu cùng lúc (nhận từ quét ảnh AI review).
4. `GET /v1/pantry-items/{id}`: Xem chi tiết nguyên liệu trong tủ.
5. `PUT /v1/pantry-items/{id}`: Cập nhật thông tin món (số lượng, vị trí bảo quản, hạn dùng).
6. `DELETE /v1/pantry-items/{id}`: Xoá nguyên liệu khỏi tủ.
7. `POST /v1/pantry-items/{id}/consume`: Dùng bớt một lượng nguyên liệu (giảm số lượng còn lại).
8. `POST /v1/pantry-items/{id}/photo`: Tải ảnh chụp thực tế của nguyên liệu lên máy chủ (`multipart/form-data`).
9. `GET /v1/pantry-items/expiring?days=3`: Lấy danh sách món sắp hoặc đã hết hạn trong N ngày.

### 2.2. Nhóm Meal Plan (9 Endpoints)
1. `GET /v1/meal-plans?weekStart=YYYY-MM-DD`: Lấy kế hoạch thực đơn theo ngày thứ Hai đầu tuần.
2. `POST /v1/meal-plans`: Tạo kế hoạch thực đơn mới cho tuần.
3. `GET /v1/meal-plans/{id}`: Xem chi tiết một kế hoạch thực đơn.
4. `DELETE /v1/meal-plans/{id}`: Xoá kế hoạch thực đơn.
5. `POST /v1/meal-plans/{id}/copy?toWeekStart=YYYY-MM-DD`: Sao chép toàn bộ thực đơn sang tuần khác.
6. `POST /v1/meal-plans/{id}/entries`: Thêm một bữa ăn vào kế hoạch (`date`, `mealType`, `recipeId`, `servings`).
7. `PATCH /v1/meal-plans/{id}/entries/{entryId}`: Cập nhật bữa ăn (đánh dấu đã nấu `cooked`, đổi khẩu phần).
8. `DELETE /v1/meal-plans/{id}/entries/{entryId}`: Xoá một bữa ăn khỏi kế hoạch.
9. `GET /v1/meal-plans/{id}/shopping-list`: Tính toán và xem trước các nguyên liệu cần mua cho cả tuần.

---

## 3. KIẾN TRÚC MÃ NGUỒN (CLEAN ARCHITECTURE THEO MẪU AUTH)

Mã nguồn được tổ chức nghiêm ngặt theo mô hình dòng chảy dữ liệu một chiều (**Unidirectional Data Flow**):

```
Screen (app/...)              <- Giao diện hiển thị, nhận dữ liệu và hàm từ Hook
       │
       ▼
Hook (usePantry, useMealPlan) <- Xử lý logic hiển thị, tính nhãn độ tươi, format ngày
       │
       ▼
Slice (pantrySlice, ...)      <- Redux state, Thunk điều phối gọi Service
       │
       ▼
Service (pantryService, ...)  <- Lớp nghiệp vụ độc lập không dính Redux/React
       │
       ▼
Repository (httpPantryRepo)   <- Gọi Axios privateHttp, bóc tách DTO chuẩn
```

- **Điểm tuân thủ tuyệt đối**: Màn hình **không** import axios, **không** gọi API trực tiếp. Nhãn độ tươi (`Còn tươi`, `Còn 2 ngày`, `Hết hạn`) được tính toán tập trung tại hook [calculateFreshness](file:///e:/pantry-chef-fe/src/features/pantry/usePantry.ts).

---

## 4. KỊCH BẢN THUYẾT TRÌNH DEMO (STEP-BY-STEP DEMO SCRIPT)

Dưới đây là kịch bản demo 9 màn hình liền mạch, giúp bạn tự tin trình bày trước giảng viên và nhóm:

### 🌟 Bước 1: Trang Tab Tủ Đồ (`src/app/(tabs)/pantry.tsx`)
- **Hành động**: Mở tab **Tủ**.
- **Lời thoại demo**:
  > *"Kính thưa Thầy/Cô và các bạn, đây là màn hình chính Tủ nguyên liệu được thiết kế theo phong cách 3D trực quan hiện đại. Toàn bộ nguyên liệu được nhóm tự động theo danh mục thực phẩm (Rau củ, Thịt, Trứng sữa) và vị trí bảo quản (Tủ mát, Tủ đông, Kệ bếp).*  
  > *Điểm đặc biệt ở đây: Nhãn độ tươi như 'Còn tươi', 'Còn 2 ngày', 'Hết hạn' được tính toán tự động ngay trong custom hook `usePantry`, đảm bảo màn hình chỉ việc hiển thị mà không chứa logic nghiệp vụ.*  
  > *Phía trên cùng là Banner 3D cảnh báo khi phát hiện nguyên liệu sắp hết hạn. Phía dưới là nút FAB nổi mở rộng 3 lối tắt: Quét mã vạch, Quét ảnh AI, và Thêm thủ công."*

### 🌟 Bước 2: Chi Tiết & Dùng Bớt Món (`src/app/pantry/[id].tsx`)
- **Hành động**: Nhấn vào món "Cà chua Đà Lạt" hoặc "Thịt ba chỉ heo".
- **Lời thoại demo**:
  > *"Khi nhấn vào một món, ta vào màn hình chi tiết nguyên liệu. Tại đây người dùng có thể:*  
  > *1. Xem thẻ thông tin 3D với ảnh chụp, số lượng, vị trí lưu trữ và hạn sử dụng.*  
  > *2. Nhấn nút 'Dùng bớt nguyên liệu': mở modal nhập số lượng đã nấu và gọi endpoint `POST /v1/pantry-items/{id}/consume`.*  
  > *3. Nhấn 'Cập nhật ảnh chụp' tích hợp thư viện `expo-image-picker` để upload ảnh thật lên server qua `POST /{id}/photo`.*  
  > *4. Chỉnh sửa thông tin hoặc Xoá khỏi tủ đồ."*

### 🌟 Bước 3: Thêm Nguyên Liệu Thủ Công (`src/app/pantry/new.tsx`)
- **Hành động**: Bấm FAB -> chọn "Thêm thủ công".
- **Lời thoại demo**:
  > *"Màn hình thêm nguyên liệu sử dụng custom hook `usePantryForm`. Form hỗ trợ nhận tham số `ingredientId` được truyền sang từ màn hình tìm kiếm nguyên liệu hoặc quét mã vạch của bạn Việt.*  
  > *Người dùng có thể chọn nhanh đơn vị đo (g, kg, quả...), chọn vị trí bảo quản trực quan (Tủ mát, Tủ đông, Kệ bếp) và nhập hạn sử dụng. Form được xác thực lỗi tức thời trước khi gửi đi."*

### 🌟 Bước 4: Xem Lại Quét Ảnh AI (`src/app/pantry/scan-review.tsx`)
- **Hành động**: Bấm FAB -> chọn "Quét ảnh AI".
- **Lời thoại demo**:
  > *"Đây là màn hình `pantry/scan-review`, nhận kết quả nhận diện hình ảnh từ module AI của bạn Thịnh. Sau khi AI phát hiện các nguyên liệu kèm độ tin cậy (Confidence), người dùng có thể điều chỉnh số lượng bằng thanh tăng giảm (stepper) hoặc loại bỏ món nhận diện nhầm.*  
  > *Khi bấm 'Lưu tất cả', hệ thống gọi endpoint `POST /v1/pantry-items/batch` để thêm đồng loạt vào tủ đồ chỉ trong một request duy nhất."*

### 🌟 Bước 5: Màn Hình Món Sắp Hết Hạn (`src/app/pantry/expiring.tsx`)
- **Hành động**: Nhấn vào Banner cảnh báo màu vàng ở trang Tủ đồ.
- **Lời thoại demo**:
  > *"Màn hình này gọi endpoint `GET /v1/pantry-items/expiring`, cho phép lọc theo các mốc thời gian: 1 ngày, 3 ngày, hoặc 7 ngày tới.*  
  > *Tại đây có các nút tác vụ nhanh: Dùng bớt ngay lập tức hoặc Bỏ đi nếu đã hỏng. Endpoint này cũng được xuất khẩu để bạn Việt sử dụng cho tính năng thông báo cục bộ (Push Notification) nhắc người dùng nấu ăn kịp thời."*

### 🌟 Bước 6: Trang Tab Thực Đơn Tuần (`src/app/(tabs)/meal-plan.tsx`)
- **Hành động**: Chuyển sang tab **Thực đơn**.
- **Lời thoại demo**:
  > *"Đây là trung tâm Kế hoạch bữa ăn hàng tuần. Màn hình hiển thị thanh trượt 7 ngày trong tuần từ Thứ 2 đến Chủ nhật với ngày hiện tại được đánh dấu nổi bật.*  
  > *Với mỗi ngày, hệ thống phân loại thành 3 bữa rõ ràng: Bữa sáng, Bữa trưa, Bữa tối. Người dùng có thể nhấn vào nút trạng thái để chuyển đổi 'Đã nấu' / 'Chưa nấu' gọi `PATCH /v1/meal-plans/{id}/entries/{entryId}`.*  
  > *Phía trên có tính năng 'Sao chép tuần' gọi `POST /{id}/copy` giúp người dùng nhân bản thực đơn yêu thích sang tuần tiếp theo mà không cần nhập lại từ đầu."*

### 🌟 Bước 7: Thêm Bữa Ăn Vào Thực Đơn (`src/app/meal-plan/add-entry.tsx`)
- **Hành động**: Nhấn vào nút "+ Thêm món" của một bữa chưa có lịch, hoặc bấm lối tắt "Thêm bữa".
- **Lời thoại demo**:
  > *"Màn hình `meal-plan/add-entry` sử dụng hook `useMealPlanEntryForm`. Người dùng chọn loại bữa ăn (Sáng/Trưa/Tối) bằng các icon khối 3D màu sắc, chọn ngày, nhập tên công thức và số khẩu phần ăn. Dữ liệu được gửi qua endpoint `POST /v1/meal-plans/{id}/entries`."*

### 🌟 Bước 8: Xem Trước & Tạo Danh Sách Mua Sắm (`src/app/meal-plan/shopping-preview.tsx`)
- **Hành động**: Nhấn lối tắt "Mua sắm" ở đầu tab Thực đơn.
- **Lời thoại demo**:
  > *"Đây là tính năng thông minh liên kết giữa Thực đơn và Tủ đồ: Gọi endpoint `GET /v1/meal-plans/{id}/shopping-list` để tự động đối chiếu các món cần nấu với nguyên liệu đang có trong nhà.*  
  > *Hệ thống liệt kê chính xác các nguyên liệu còn thiếu. Khi người dùng nhấn 'Lưu thành danh sách mua sắm', hệ thống tích hợp API Shopping của bạn Thiệu để tự động tạo một Shopping List mới."*

### 🌟 Bước 9: Trợ Lý AI Soạn Thực Đơn Tuần (`src/app/ai/meal-plan.tsx`)
- **Hành động**: Nhấn lối tắt "AI gợi ý" ở tab Thực đơn.
- **Lời thoại demo**:
  > *"Cuối cùng là tính năng Trợ lý AI Soạn Thực Đơn: Người dùng chọn số ngày muốn lên lịch (3, 5, 7 ngày) và thời gian nấu tối đa mỗi bữa (15-60 phút). Bấm 'Tạo bản nháp thực đơn AI' sẽ gọi endpoint `POST /v1/ai/meal-plan`.*  
  > *AI sẽ đề xuất các món ăn tối ưu theo nguyên liệu sắp hết hạn trong tủ. Người dùng xem lại bản nháp và chỉ cần một chạm 'Lưu vào thực đơn tuần' (`POST /v1/meal-plans`) để chính thức áp dụng."*

---

## 5. DỊCH VỤ CUNG CẤP CHO THÀNH VIÊN KHÁC TRONG NHÓM

1. **Cho bạn Tùng (Recipe & Tìm món theo nguyên liệu)**:
   - Cung cấp hook `usePantry()`: Tùng có thể import trực tiếp `const { items } = usePantry()` để lấy danh sách tên nguyên liệu đang có trong tủ, phục vụ chức năng "Tìm công thức theo nguyên liệu có sẵn".
2. **Cho bạn Việt (Cài đặt & Thông báo nhắc hạn)**:
   - Cung cấp hàm `loadExpiring(days)` và endpoint `GET /v1/pantry-items/expiring`: Việt dùng để kích hoạt các tác vụ lập lịch thông báo định kỳ (Local Notification) cho người dùng mỗi buổi sáng.
3. **Cho bạn Thiệu (Shopping Lists)**:
   - Tích hợp liền mạch qua `ShoppingService.saveItemsAsList()`, đưa nguyên liệu thiếu từ thực đơn tuần trực tiếp vào danh sách mua sắm.

---

## 6. HƯỚNG DẪN CHẠY DEMO TRÊN MÁY

```bash
# 1. Kiểm tra tính đúng đắn kiểu dữ liệu TypeScript (Zero errors)
npm run typecheck

# 2. Khởi chạy ứng dụng Expo
npm run start
```
*Ghi chú: Toàn bộ ứng dụng sử dụng 100% dữ liệu gọi trực tiếp từ backend API (`/v1/pantry-items`, `/v1/meal-plans`, `/v1/ai/meal-plan`), không sử dụng dữ liệu tĩnh (mock). Khi backend hoạt động, dữ liệu được đồng bộ hóa tức thời.*
