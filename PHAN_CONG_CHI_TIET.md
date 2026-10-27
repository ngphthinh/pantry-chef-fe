# Phân công chi tiết 6 thành viên (endpoint + màn hình)

Mỗi người phụ trách **một lát cắt dọc** (vertical slice): các endpoint của mình, thư mục `features/<tên>/` tương ứng và các màn hình dùng chính các endpoint đó. Cách viết code theo `README.md` (mẫu feature `auth`).

---

## 0. Quy tắc commit

Cả nhóm dùng **Conventional Commits** để lịch sử dễ đọc và dễ biết ai/việc gì.

### 0.1 Cấu trúc

```
<type>(<scope>): <mô tả ngắn>

[nội dung chi tiết - tuỳ chọn]

[footer - tuỳ chọn]
```

- Dòng đầu **tối đa 72 ký tự**, **không có dấu chấm cuối**.
- `<mô tả ngắn>` viết bằng **tiếng Việt**, bắt đầu bằng **động từ viết thường**, nói rõ *làm gì* (ví dụ: `thêm`, `sửa`, `xoá`, `tách`, `đổi tên`).
- Phần nội dung chi tiết chỉ viết khi cần giải thích **vì sao** (không lặp lại code đã thể hiện *cái gì*). Cách một dòng trống so với dòng đầu.

### 0.2 Danh sách `type`

| type | Dùng khi | Ví dụ |
|---|---|---|
| `feat` | Thêm tính năng/màn hình/endpoint mới | `feat(pantry): thêm màn hình chi tiết món trong tủ` |
| `fix` | Sửa lỗi | `fix(user): giữ email và avatar khi cập nhật tên` |
| `refactor` | Đổi cấu trúc code, không đổi hành vi | `refactor(pantry): tách logic form vào usePantryForm` |
| `style` | Định dạng, đổi tên biến, dấu cách (không đổi logic) | `style(ui): chuẩn hoá khoảng cách của Card` |
| `perf` | Cải thiện hiệu năng | `perf(recipe): cache chi tiết công thức theo externalId` |
| `test` | Thêm/sửa test | `test(auth): thêm test restore phiên đăng nhập` |
| `docs` | Chỉ sửa tài liệu | `docs: cập nhật API_DOCUMENTATION cho pantry` |
| `build` | Thay đổi thư viện, cấu hình build | `build(deps): nâng cấp expo-image-picker` |
| `ci` | Thay đổi CI/CD | `ci: thêm bước chạy lint và typecheck` |
| `chore` | Việc vặt không thuộc nhóm trên | `chore: xoá file không dùng` |
| `revert` | Hoàn tác commit trước | `revert: hoàn tác "feat(shopping): ..."` |

### 0.3 Danh sách `scope`

Dùng **tên feature** của mình (khớp thư mục `features/<tên>` và bảng phân công). Mỗi commit chỉ nên có **một scope**.

| Scope | Người phụ trách chính | Ghi chú |
|---|---|---|
| `auth`, `user`, `ai` | Thịnh | |
| `ingredient`, `excluded`, `sync`, `meta` | Việt | `excluded` = nguyên liệu loại trừ |
| `pantry`, `meal-plan` | Trường | |
| `recipe`, `custom-recipe` | Tùng | `custom-recipe` cho cả phần giao diện của Thiệu |
| `saved-recipe`, `collection`, `stats` | Thuận | |
| `shopping`, `cuisine`, `unit`, `feedback` | Thiệu | |
| `ui`, `core`, `store`, `types`, `nav` | Dùng chung | Chỉ thêm, hạn chế sửa dòng của người khác; PR cần Thịnh review |
| `deps`, `ci`, `docs` | Dùng chung | |

Commit chạm nhiều feature (hiếm) thì **bỏ scope** hoặc tách thành nhiều commit.

### 0.4 Thay đổi phá vỡ (breaking change)

Thêm `!` sau scope và ghi rõ trong footer để người khác biết phải sửa theo:

```
refactor(types)!: đổi PantryItemResponse.unit thành enum Unit

BREAKING CHANGE: các màn hình dùng unit kiểu string phải đổi sang Unit.
```

### 0.5 Ví dụ commit tốt và chưa tốt

| Tốt | Chưa tốt | Vì sao |
|---|---|---|
| `feat(pantry): thêm API và hook lấy danh sách món sắp hết hạn` | `update code` | Không nói rõ làm gì, ở đâu |
| `fix(shopping): gửi đủ 4 trường khi đánh dấu đã mua` | `fix bug shopping` | Không nói lỗi gì; thiếu scope đúng quy ước |
| `refactor(user): chuyển useUser sang đọc userSlice` | `refactor lung tung` | Mơ hồ |
| `feat(auth): thêm màn hình quên mật khẩu` | `feat(auth): thêm màn hình quên mật khẩu, sửa luôn pantry và đổi theme.` | Gộp nhiều việc, có dấu chấm cuối |

### 0.6 Quy tắc khi commit

1. **Một commit = một việc.** Không gộp "thêm tính năng" với "sửa lỗi khác" hay "định dạng lại cả file".
2. **Commit nhỏ, thường xuyên**, mỗi commit phải **chạy được** (không làm hỏng build/typecheck).
3. **Không commit trực tiếp vào `main`.** Làm trên nhánh `feature/<tên>-<việc>` (như mục 7), mở PR để Thịnh review.
4. **Tên PR** viết theo đúng quy tắc commit (`feat(pantry): ...`). Gộp PR bằng **squash**, nên tiêu đề PR sẽ thành commit trên `main`.
5. **Không commit:** `node_modules`, file `.env`, khoá/token/mật khẩu, file build, ảnh test lớn. Kiểm tra `git status` trước khi `git add`.
6. **Không dùng** `git add .` một cách mù quáng; thêm đúng file cần thiết.
7. **Không sửa lịch sử** (`rebase`/`push --force`) trên nhánh đã có người khác dùng. Trên nhánh cá nhân của mình thì được.
8. **Liên kết công việc** (nếu có issue/task) ở footer: `Refs: #12` hoặc `Closes: #12`.
9. **Sửa PR theo review** thì commit mới (`fix(...)`/`refactor(...)`) hoặc `--fixup`, tuỳ nhóm thống nhất; trước khi merge phải gọn.

### 0.7 Tự kiểm tra trước khi commit

- [ ] Dòng đầu có đủ `type(scope): mô tả`, ≤ 72 ký tự, không dấu chấm cuối.
- [ ] Commit chỉ chứa **một** việc và đúng scope.
- [ ] Đã chạy lint/typecheck, không còn `console.log` hay code thừa.
- [ ] Không có file bí mật hoặc file không liên quan.

---

## 1. Cách mình suy ra phân công (cần xác nhận)

Cột **"Khối lượng"** trong `phan-cong.md` khớp **chính xác** với số endpoint trong OpenAPI (tổng 93, không tính `GET /v1/auth/test`):

| Thành viên | Phép tính trong `phan-cong.md` | Đối chiếu với OpenAPI |
|---|---|---|
| Thịnh | AI 5 + Auth 8 = 13 | AI 5; Auth: register, login, refresh-token, logout, introspect, forgot-password, reset-password, change-password = 8 |
| Việt | Ingredient 13 + 3 = 16 | Ingredients 6 + Categories 4 + Excluded ingredients 3 = 13; Sync 1 + Meta 2 = 3 |
| Trường | Pantry 9 + Meal Plan 9 = 18 | Khớp |
| Tùng | Recipe 8 + Custom 6 = 14 | Khớp |
| Thuận | Cookbook 11 + Common 6 = 17 | Cookbook: Saved recipes 5 + Collections 6 = 11 |
| Thiệu | Shopping 11 + Cuisine 4 = 15 | Cuisine 4; Shopping lists/items 8 |

Hai chỗ **không ghi rõ** trong `phan-cong.md`, mình tự suy ra cho đủ 93 endpoint:

- **"Common" (6)** = nhóm User (`GET/PUT/DELETE /users/me`, `PUT /users/me/avatar`, `GET /users/admin`) + `GET /stats/me`. **Theo điều chỉnh mới, nhóm User (5) chuyển sang Thịnh**, Thuận chỉ giữ `GET /stats/me`. Vì vậy số endpoint của hai người này khác `phan-cong.md`: Thịnh 18, Thuận 12 (tổng vẫn 93).
- **3 endpoint còn thiếu của "Shopping" của Thiệu (11 = 8 + 3)** = `GET /units/convert` + `GET /feedback` + `POST /feedback`.

> Cột "Số endpoint" (6, 9, 14, 4, 5, 0) mình **không dùng**. Mình đoán đó là số endpoint còn phải làm, nhưng Thiệu ghi 0 trong khi có 15 endpoint nên chưa rõ nghĩa. Nếu cách chia Common/Shopping ở trên không đúng ý, chỉ cần đổi vài dòng ở mục 3.

---

## 2. Bảng tổng hợp

| Thành viên | Endpoint | Số màn hình | Thư mục feature | Việc ưu tiên |
|---|---:|---:|---|---|
| **Thịnh** (lead) | 18 | 15 | `auth`, `user`, `ai` | Khung chung, đăng nhập sớm, review/CI |
| **Việt** | 16 | 5 | `ingredient`, `excludedIngredient`, `sync`, `meta` | **Seed `IngredientCategory`, `SyncStatus` trước** |
| **Trường** | 18 | 9 | `pantry`, `mealPlan` | Upload ảnh, cảnh báo sắp hết hạn, xem trước danh sách mua |
| **Tùng** | 14 | 7 | `recipe`, `customRecipe` | API ngoài, cache, cursor dạng offset |
| **Thuận** | 12 | 6 | `savedRecipe`, `collection`, `stats` | Response đủ dữ liệu để cache/offline |
| **Thiệu** | 15 | 8 | `shopping`, `cuisine`, `unit`, `feedback` | **Seed `Cuisine` sớm** (Tùng cần) |
| | **93** | **50** | | |

Tổng 50 màn hình = 44 màn hình con + 5 trang trung tâm của tab + `+not-found` (đúng với bản phác thảo).

---

## 3. Chi tiết từng người

### 3.1 Thịnh — Auth + User + AI + Lead

**Endpoint (18)**

| Nhóm | Endpoint |
|---|---|
| User (5) | `GET`, `PUT`, `DELETE /v1/users/me`; `PUT /v1/users/me/avatar`; `GET /v1/users/admin` |
| Auth (8) | `POST /v1/auth/register`, `login`, `refresh-token`, `logout`, `introspect`; `PATCH /v1/auth/forgot-password`, `reset-password`, `change-password` |
| AI (5) | `POST /v1/ai/recognize`, `recipe-ideas`, `substitutions`, `meal-plan`, `adapt-recipe` |

**Màn hình (15)**

| Màn hình | Ghi chú |
|---|---|
| `index` | Màn khởi động, gọi `restoreSession()` rồi chuyển hướng |
| `onboarding` | Dùng cờ `ONBOARDING_KEY` |
| `login`, `register`, `forgot-password`, `reset-password` | Dùng `validators` trong `auth/validation.ts` |
| `settings/change-password` | Gọi `changePassword`, xong tự đăng xuất |
| `settings/profile` | Đổi tên, đổi avatar (dùng `useUser`). Nên tách logic thành `useProfileForm`, `useAvatarPicker` như `README.md` |
| `settings/preferences` | `themeMode`, `measurementSystem` qua `PUT /users/me` |
| `settings/delete-account` | Xác nhận xoá (web dùng `window.confirm`, mobile dùng `Alert`) |
| `pantry/scan` | Chụp/chọn ảnh, gọi `recognize`, **chuyển kết quả sang `pantry/scan-review` (Trường)** |
| `ai/ideas` | `recipe-ideas` |
| `ai/adapted-recipe` | `adapt-recipe` |
| `dev/ui-kit` | Bộ UI dùng chung (`Button`, `Card`, `TextField`...) |
| `+not-found` | |

**Việc của lead (theo `phan-cong.md`)**

- Giữ khung chung: tab layout `(tabs)/_layout`, `core/di/container`, `store`, HTTP client, `@/components/ui`.
- **Chốt cách bóc `data` của `ApiResponse` ở HTTP client** (hiện `getMe` và `updateMe` đang làm khác nhau). Việc này làm **đầu tiên**, vì mọi người đều dùng chung.
- Sửa nợ kỹ thuật, review PR, CI, test tích hợp.
- Sở hữu `useUser`/`userActions` (đang nằm sẵn trong `features/auth`) và sửa lỗi mất email/avatar khi đổi tên (xem `README.md`).

> **Lưu ý tải việc:** Thịnh hiện có nhiều việc nhất (18 endpoint, 15 màn hình, cộng việc lead). Nếu cần giảm tải, có thể chuyển `ai/ideas` và `ai/adapted-recipe` sang Thuận (người ít việc nhất, 12 endpoint, 6 màn hình).

**Cung cấp cho người khác:** `useAuth`, `useUser`, `privateHttp`/`publicHttp`, tự refresh token khi gặp 401, bộ UI chung.

---

### 3.2 Việt — Ingredient + Sync

**Endpoint (16)**

| Nhóm | Endpoint |
|---|---|
| Ingredients (6) | `GET /v1/ingredients/search`, `/{id}`, `/barcode/{code}`; `POST`, `PUT /{id}`, `DELETE /{id}` |
| Ingredient categories (4) | `GET`, `POST`, `PUT /{id}`, `DELETE /{id}` tại `/v1/ingredient-categories` |
| Excluded ingredients (3) | `GET`, `POST`, `DELETE /{id}` tại `/v1/users/me/excluded-ingredients` |
| Sync (1) | `GET /v1/sync-statuses` |
| Meta (2) | `GET /v1/meta/enums`, `GET /v1/meta/units` |

**Màn hình (5)**

| Màn hình | Ghi chú |
|---|---|
| `pantry/select-ingredient` | Tìm nguyên liệu (cursor), **trả `ingredientId` về cho `pantry/new` và `pantry/scan-review` (Trường)**. Làm thành màn hình/hook dùng lại được |
| `pantry/barcode` | Quét mã vạch → `GET /ingredients/barcode/{code}` → chuyển sang `pantry/new` đã điền sẵn nguyên liệu |
| `settings/excluded-ingredients` | Thêm/xoá nguyên liệu loại trừ |
| `settings/notifications` | Cài đặt nhắc hết hạn (thông báo cục bộ); lấy dữ liệu từ `GET /pantry-items/expiring` của Trường |
| `dev/dev-tools` | Xem `sync-statuses`, xoá cache/token để test |

**Việc ưu tiên:** seed `IngredientCategory` và `SyncStatus` **trước tiên** (Trường cần danh mục để lọc và tạo món trong tủ).

**Cung cấp cho người khác:** `useIngredientSearch`, màn `select-ingredient`, enum/unit từ `meta`.

---

### 3.3 Trường — Pantry + Meal Plan

**Endpoint (18)**

| Nhóm | Endpoint |
|---|---|
| Pantry (9) | `GET`, `POST /v1/pantry-items`; `POST /batch`; `GET`, `PUT`, `DELETE /{id}`; `POST /{id}/consume`; `POST /{id}/photo`; `GET /expiring` |
| Meal plan (9) | `GET /v1/meal-plans?weekStart=`, `POST`; `GET`, `DELETE /{id}`; `POST /{id}/copy`; `POST /{id}/entries`; `PATCH`, `DELETE /{id}/entries/{entryId}`; `GET /{id}/shopping-list` |

**Màn hình (9)**

| Màn hình | Ghi chú |
|---|---|
| Trang tab **Tủ** (`pantry` index) | Danh sách nhóm theo danh mục, nút lọc, banner "sắp hết hạn", menu nổi (quét mã vạch / quét ảnh AI / thêm thủ công). Nhãn "Còn tươi / Còn 2 ngày / Hết hạn" **tính trong hook**, không tính ở giao diện |
| `pantry/[id]` | Chi tiết, sửa, dùng bớt (`consume`), xoá, upload ảnh |
| `pantry/new` | Form thêm thủ công (dùng `usePantryForm`); nhận `ingredientId` từ `select-ingredient`/`barcode` (Việt) |
| `pantry/scan-review` | Nhận kết quả AI từ `pantry/scan` (Thịnh), cho sửa rồi gọi `POST /pantry-items/batch` |
| `pantry/expiring` | `GET /pantry-items/expiring` |
| Trang tab **Thực đơn** (`meal-plan` index) | Lưới tuần theo `weekStart`, sao chép sang tuần khác |
| `meal-plan/add-entry` | Thêm/sửa bữa ăn (`BREAKFAST/LUNCH/DINNER`) |
| `meal-plan/shopping-preview` | `GET /meal-plans/{id}/shopping-list`, có nút lưu thành danh sách mua sắm (dùng API của Thiệu) |
| `ai/meal-plan` | Gọi `POST /ai/meal-plan` (Thịnh) lấy bản nháp, xem lại, rồi `POST /meal-plans` để lưu |

**Cung cấp cho người khác:** `usePantry` (Tùng dùng để tìm món theo nguyên liệu trong tủ), `GET /expiring` (Việt dùng cho thông báo).

---

### 3.4 Tùng — Recipe + Công thức ngoài

**Endpoint (14)**

| Nhóm | Endpoint |
|---|---|
| Recipes ngoài (8) | `GET /v1/recipes/{externalId}`, `/{externalId}/similar`, `/{externalId}/scale`, `/suggestions`, `/search`, `/by-name`, `/popular`, `/random` |
| Custom recipes (6) | `GET`, `POST /v1/recipes/custom`; `GET`, `PUT`, `DELETE /custom/{id}`; `POST /custom/{id}/image` |

> Phần **backend** của 14 endpoint này là của Tùng (phần khó nhất: tích hợp API ngoài, cache, cursor kiểu offset). Phần **giao diện** của custom recipe giao cho Thiệu để giảm tải cho Tùng.

**Màn hình (7)**

| Màn hình | Ghi chú |
|---|---|
| Trang tab **Tìm món** (`search` index) | Ô tìm theo tên, chip nguyên liệu trong tủ (lấy từ `usePantry` của Trường), nút "Tìm công thức (N nguyên liệu)", lối tắt |
| `search/results` | `GET /recipes/search?ingredients=...` (gửi mảng **dạng lặp tham số**), có `matchScore`, `missingIngredients` |
| `search/suggestions` | `GET /recipes/suggestions` |
| `search/discover` | `popular`, `random`, `by-name` |
| `recipe/external/[externalId]` | Chi tiết công thức, đổi khẩu phần (`scale`), nút lưu (gọi API của Thuận), nút thêm vào thực đơn |
| `recipe/similar` | `GET /recipes/{externalId}/similar` |
| `recipe/cooking` | Chế độ nấu từng bước, đếm giờ theo `timerSeconds` |

**Cung cấp cho người khác:** `useRecipeDetail` (Thuận dùng ở `recipe/saved/[id]`, Trường dùng khi chọn món cho thực đơn), hợp đồng "id uuid vs externalId".

---

### 3.5 Thuận — Cookbook + Stats

**Endpoint (12)**

| Nhóm | Endpoint |
|---|---|
| Saved recipes (5) | `GET`, `POST /v1/saved-recipes`; `GET`, `PATCH`, `DELETE /{id}` |
| Collections (6) | `GET`, `POST /v1/collections`; `PUT`, `DELETE /{id}`; `POST`, `DELETE /{id}/recipes/{savedRecipeId}` |
| Stats (1) | `GET /v1/stats/me` |

**Màn hình (6)**

| Màn hình | Ghi chú |
|---|---|
| Trang tab **Đã lưu** (`saved` index) | 4 tab con: Tất cả / Yêu thích (`favorite=true`) / Bộ sưu tập / Tự tạo |
| `recipe/saved/[id]` | Đánh giá (1–5), ghi chú, yêu thích, thêm vào bộ sưu tập |
| `collection/index`, `collection/[id]` | CRUD bộ sưu tập, thêm/bỏ món |
| Trang tab **Thêm** (`more` index) | Menu theo nhóm (xem bản phác thảo), thẻ hồ sơ ở đầu (đọc `useUser` của Thịnh, bấm vào mở `settings/profile`), đăng xuất (`useAuth`) |
| `settings/stats` | `GET /stats/me` |

**Việc kỹ thuật riêng:** response của saved recipe và collection phải **đủ dữ liệu để mobile cache và xem offline** (theo ghi chú trong `phan-cong.md`). Thuận định nghĩa chiến lược cache dùng chung cho cả nhóm đã lưu.

**Lưu ý:** nhóm User đã chuyển sang Thịnh; Thuận chỉ **đọc** `useUser`/`useAuth` cho thẻ hồ sơ ở trang Thêm, không tự gọi API user.

---

### 3.6 Thiệu — Shopping + Cuisine

**Endpoint (15)**

| Nhóm | Endpoint |
|---|---|
| Shopping lists (5) | `GET`, `POST /v1/shopping-lists`; `GET`, `PUT`, `DELETE /{id}` |
| Shopping items (3) | `POST /{listId}/items`; `PATCH`, `DELETE /{listId}/items/{itemId}` |
| Cuisine (4) | `GET`, `POST /v1/cuisines`; `PUT`, `DELETE /{id}` |
| Unit convert (1) | `GET /v1/units/convert` |
| Feedback (2) | `GET`, `POST /v1/feedback` |

**Màn hình (8)**

| Màn hình | Ghi chú |
|---|---|
| `shopping/index`, `shopping/[id]` | Danh sách và chi tiết; đánh dấu đã mua dùng `PATCH` (**phải gửi đủ cả 4 trường** `name, quantity, unit, status`) |
| `recipe/custom/index` | Danh sách công thức tự tạo (API của Tùng) |
| `recipe/custom/[id]` | Chi tiết, sửa, xoá |
| `recipe/custom/form` | Form tạo/sửa (nguyên liệu + bước), chọn ẩm thực (cuisine của Thiệu), upload ảnh |
| `settings/unit-converter` | `GET /units/convert` |
| `settings/feedback` | `POST /feedback` |
| `settings/about` | Màn tĩnh (giới thiệu, quyền riêng tư) |

**Việc ưu tiên:** seed `Cuisine` **sớm** vì Tùng (bộ lọc `cuisineId`) và form tạo công thức cần.

---

## 4. Bản đồ 50 màn hình theo người phụ trách

| Nhóm | Màn hình | Phụ trách |
|---|---|---|
| Khởi động | `index`, `onboarding`, `login`, `register`, `forgot-password`, `reset-password` | Thịnh |
| Tab Tủ | trang `pantry` | Trường |
| | `pantry/[id]`, `pantry/new`, `pantry/scan-review`, `pantry/expiring` | Trường |
| | `pantry/select-ingredient`, `pantry/barcode` | Việt |
| | `pantry/scan` | Thịnh |
| Tab Tìm món | trang `search`, `search/results`, `search/suggestions`, `search/discover` | Tùng |
| | `recipe/external/[externalId]`, `recipe/similar`, `recipe/cooking` | Tùng |
| Tab Đã lưu | trang `saved`, `recipe/saved/[id]`, `collection/index`, `collection/[id]` | Thuận |
| | `recipe/custom/index`, `recipe/custom/[id]`, `recipe/custom/form` | Thiệu |
| Tab Thực đơn | trang `meal-plan`, `meal-plan/add-entry`, `meal-plan/shopping-preview`, `ai/meal-plan` | Trường |
| Tab Thêm | trang `more` | Thuận |
| | `shopping/index`, `shopping/[id]` | Thiệu |
| | `ai/ideas`, `ai/adapted-recipe` | Thịnh |
| | `settings/stats` | Thuận |
| | `settings/excluded-ingredients`, `settings/notifications` | Việt |
| | `settings/profile`, `settings/preferences`, `settings/change-password`, `settings/delete-account` | Thịnh |
| | `settings/unit-converter`, `settings/feedback`, `settings/about` | Thiệu |
| | `dev/ui-kit` | Thịnh |
| | `dev/dev-tools` | Việt |
| Chung | `+not-found` | Thịnh |

---

## 5. Các luồng cần hai người phối hợp

Mỗi luồng dưới đây cần **chốt hợp đồng** (tên màn hình, tham số, kiểu dữ liệu) ngay từ đầu:

| Luồng | Bên cung cấp → Bên dùng | Hợp đồng cần thống nhất |
|---|---|---|
| Quét ảnh AI → xem lại → thêm vào tủ | `pantry/scan` (Thịnh) → `pantry/scan-review` (Trường) | Truyền `RecognizedIngredientResponse[]` (qua tham số route hoặc store). Review phải gán được `ingredientId` (qua `select-ingredient` của Việt) trước khi gọi `batch` |
| Quét mã vạch → thêm món | `pantry/barcode` (Việt) → `pantry/new` (Trường) | Truyền `ingredientId` (và tên) qua tham số route |
| Chọn nguyên liệu | `select-ingredient` (Việt) → `pantry/new`, `scan-review` (Trường) | Trả về `{ ingredientId, name, defaultUnit }` |
| Tìm món theo tủ | `usePantry` (Trường) → `search` (Tùng) | Tùng chỉ **đọc** danh sách tên nguyên liệu, không gọi API pantry trực tiếp |
| Lưu công thức | `recipe/external` (Tùng) → saved-recipes (Thuận) | Gửi `externalId` hoặc `recipeId` (một trong hai) |
| Thêm món vào thực đơn | `recipe/*` (Tùng) → `meal-plan/add-entry` (Trường) | Meal plan dùng `recipeId` (uuid), **không** dùng `externalId` |
| Xem trước danh sách mua → lưu | `meal-plan/shopping-preview` (Trường) → shopping (Thiệu) | Dùng API `POST /shopping-lists` + `POST /{listId}/items` của Thiệu |
| Tạo công thức tự tạo | `custom/form` (Thiệu) ↔ API custom (Tùng) + `cuisines` (Thiệu) | Body theo `RecipeCreateRequest`; `PUT` là thay thế toàn bộ |
| Nhắc hết hạn | `settings/notifications` (Việt) ← `GET /pantry-items/expiring` (Trường) | Việt gọi `usePantry().expiring` |
| Thẻ hồ sơ → hồ sơ | `more` (Thuận) → `settings/profile` (Thịnh) | Thuận chỉ đọc `useUser().user` và điều hướng; không gọi API user |
| AI soạn thực đơn | `POST /ai/meal-plan` (Thịnh) → `ai/meal-plan` (Trường) | `weekStart` của AI là `date-time`, của meal-plan là `date` |

---

## 6. Thứ tự làm việc đề xuất

**Giai đoạn 0 (làm ngay, chặn người khác)**
1. **Thịnh:** chốt cách bóc `data` ở HTTP client; dựng tab layout, DI container, bộ UI chung; hoàn tất đăng nhập để mọi người có token test.
2. **Việt:** seed `IngredientCategory`, `SyncStatus`.
3. **Thiệu:** seed `Cuisine`.

**Giai đoạn 1 (song song)** — mỗi người làm lát cắt của mình theo thứ tự: `types` → repository → service → slice → hook → màn hình (đúng như `README.md`). Dùng dữ liệu mẫu/mock cho phần phụ thuộc người khác nếu họ chưa xong.

**Giai đoạn 2 (nối luồng)** — các luồng ở mục 5; Thịnh chạy test tích hợp.

**Giai đoạn 3** — offline/cache (Thuận chủ trì), thông báo hết hạn (Việt), hoàn thiện, sửa lỗi, dọn nợ kỹ thuật.

---

## 7. Quy tắc làm việc chung (để không dẫm chân nhau)

- **Mỗi người chỉ sửa trong thư mục feature của mình.** File dùng chung (`core/`, `store/`, `@/components/ui`, `@/types`, `core/di/container`) chỉ **thêm**, không sửa dòng của người khác; nếu cần sửa thì nhờ Thịnh review.
- **Kiểu dữ liệu (`@/types`):** mỗi người thêm DTO của domain mình vào file riêng (ví dụ `types/pantry.ts`) và export qua file chung, tránh cùng sửa một file.
- **DI container và store:** mỗi feature thêm đúng một khối riêng, đặt theo thứ tự chữ cái để hạn chế xung đột merge.
- **Nhánh và PR:** `feature/<tên>-<việc>`; mọi PR do Thịnh review (theo phân công lead); không merge khi CI đỏ.
- **Đặt tên, phân lớp, logic nằm trong hook:** theo `README.md`. Màn hình không import axios, service hay slice.
- **Thay đổi API:** báo vào nhóm và cập nhật `API_DOCUMENTATION.md` trong cùng PR.
