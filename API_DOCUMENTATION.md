# Tài liệu gọi API

Tài liệu này mô tả cách gọi backend của ứng dụng (nấu ăn, tủ đồ, kế hoạch bữa ăn, danh sách mua sắm). Đọc phần 1 và 2 trước, sau đó tra cứu từng nhóm API ở phần 4 khi cần.

> Nguồn: file OpenAPI 3.1 (`/v1/...`). Những gì **không có trong file OpenAPI** (cách xác thực, định dạng lỗi, phân quyền admin) được ghi rõ là *suy ra* hoặc *chưa xác nhận*.

---

## Mục lục

1. [Thông tin chung](#1-thông-tin-chung)
2. [Bắt đầu nhanh (5 phút)](#2-bắt-đầu-nhanh-5-phút)
3. [Các giá trị enum](#3-các-giá-trị-enum)
4. [Danh sách API theo nhóm](#4-danh-sách-api-theo-nhóm)
   - [4.1 Auth](#41-auth--xác-thực)
   - [4.2 User](#42-user--người-dùng)
   - [4.3 Nguyên liệu loại trừ](#43-excluded-ingredients--nguyên-liệu-loại-trừ)
   - [4.4 Recipes](#44-recipes--công-thức-nguồn-ngoài)
   - [4.5 Custom recipes](#45-custom-recipes--công-thức-tự-tạo)
   - [4.6 Saved recipes](#46-saved-recipes--công-thức-đã-lưu)
   - [4.7 Collections](#47-collections--bộ-sưu-tập)
   - [4.8 Pantry](#48-pantry--tủ-đồ)
   - [4.9 Ingredients / Categories / Cuisines](#49-ingredients--categories--cuisines)
   - [4.10 Shopping lists](#410-shopping-lists--danh-sách-mua-sắm)
   - [4.11 Meal plans](#411-meal-plans--kế-hoạch-bữa-ăn)
   - [4.12 AI](#412-ai)
   - [4.13 Khác](#413-khác-stats-meta-units-sync-feedback)
5. [Tham chiếu cấu trúc dữ liệu](#5-tham-chiếu-cấu-trúc-dữ-liệu)
6. [Mẫu code client (axios)](#6-mẫu-code-client-axios)
7. [Lưu ý và điểm cần kiểm tra](#7-lưu-ý-và-điểm-cần-kiểm-tra)

---

## 1. Thông tin chung

### 1.1 Base URL

```
http://localhost:8080/api
```

Mọi đường dẫn trong tài liệu đều nằm **sau** base URL. Ví dụ `GET /v1/users/me` thực tế là:

```
GET http://localhost:8080/api/v1/users/me
```

> Khi chạy app trên điện thoại thật hoặc emulator, `localhost` không trỏ tới máy tính của bạn. Android emulator dùng `10.0.2.2`, điện thoại thật dùng IP LAN của máy (ví dụ `192.168.1.10`).

### 1.2 Header

| Header | Khi nào dùng | Giá trị |
|---|---|---|
| `Content-Type` | Request có body JSON | `application/json` |
| `Content-Type` | Upload ảnh | `multipart/form-data` (client tự thêm boundary, đừng tự viết tay) |
| `Authorization` | API cần đăng nhập | `Bearer <accessToken>` |

### 1.3 Xác thực (suy ra, chưa có trong OpenAPI)

File OpenAPI không khai báo `securitySchemes`, nhưng dựa vào các API `login` / `refresh-token` / `logout` và tên trường `accessToken`, `tokenType`, cách dùng hợp lý là:

- **API công khai (không cần token):** `register`, `login`, `refresh-token`, `logout`, `introspect`, `forgot-password`, `reset-password`.
- **Các API còn lại:** gửi `Authorization: Bearer <accessToken>`.
- `change-password` cần token (client hiện tại gọi bằng `privateHttp`).

Token hết hạn sau `expiresIn` (giây, theo kiểu `int64`). Khi API trả `401`, dùng `refreshToken` để lấy cặp token mới (xem [4.1](#41-auth--xác-thực)).

### 1.4 Cấu trúc response chung

Hầu hết API trả về một "vỏ" bọc ngoài, dữ liệu thật nằm trong `data`:

```json
{
  "code": "string",
  "message": "string",
  "data": { }
}
```

| Trường | Ý nghĩa |
|---|---|
| `code` | Mã nghiệp vụ (giá trị cụ thể không có trong OpenAPI) |
| `message` | Thông điệp mô tả |
| `data` | Dữ liệu chính. Với API không trả gì có ý nghĩa (`ApiResponseVoid`), `data` là object rỗng/`null` |

**Quan trọng:** khi viết code, nhớ lấy `response.data.data`, không phải `response.data`. Nếu client của bạn có interceptor tự "bóc" lớp ngoài, hãy chắc chắn mọi API đều đi qua cùng một cách xử lý (xem [mục 7](#7-lưu-ý-và-điểm-cần-kiểm-tra)).

Các API trả `204 No Content` **không có body**.

### 1.5 Phân trang kiểu cursor

Các API danh sách lớn (`shopping-lists`, `saved-recipes`, `recipes/custom`, `pantry-items`, `feedback`, `recipes/search`, ...) dùng phân trang **cursor**, không dùng số trang.

Request:

| Query | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `cursor` | uuid (hoặc string với nhóm `recipes`) | không có | Bỏ trống ở lần gọi đầu. Các lần sau truyền `nextCursor` của lần trước |
| `size` | int | thường 20 | Số phần tử mỗi lần |

Response (`data`):

```json
{
  "content": [ /* danh sách phần tử */ ],
  "hasNext": true,
  "nextCursor": "b2c8e5a0-...."
}
```

Cách tải trang kế tiếp: nếu `hasNext = true` thì gọi lại cùng API với `cursor=<nextCursor>`. Lặp lại tới khi `hasNext = false`.

> Lưu ý giới hạn `size`: `saved-recipes` (1–50, mặc định 10), `feedback` (1–30, mặc định 20), `users/admin` (10–50, mặc định 10).

### 1.6 Kiểu dữ liệu

| Kiểu | Định dạng | Ví dụ |
|---|---|---|
| `uuid` | chuỗi UUID | `550e8400-e29b-41d4-a716-446655440000` |
| `date` | `YYYY-MM-DD` | `2026-10-27` |
| `date-time` | ISO 8601 | `2026-10-27T08:30:00Z` |
| `double` | số thực | `500`, `1.5` |

### 1.7 Mã HTTP thường gặp

| Mã | Ý nghĩa |
|---|---|
| `200` | Thành công, có body |
| `201` | Tạo mới thành công |
| `204` | Thành công, không có body |
| `400` | Dữ liệu gửi lên sai (thiếu trường bắt buộc, sai định dạng) *(suy ra)* |
| `401` | Chưa đăng nhập hoặc token hết hạn *(suy ra)* |
| `403` | Không đủ quyền *(suy ra)* |
| `404` | Không tìm thấy *(suy ra)* |

> Định dạng body lỗi **không có trong OpenAPI**. Hãy thử gọi sai một lần và xem response thật, rồi bổ sung vào đây.

---

## 2. Bắt đầu nhanh (5 phút)

Luồng cơ bản: **Đăng ký → Đăng nhập → Gọi API kèm token → Làm mới token → Đăng xuất.**

### Bước 1. Đăng ký

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "an@example.com",
    "password": "123456",
    "displayName": "Nguyễn Văn An"
  }'
```

Trả về `201` với thông tin user vừa tạo.

### Bước 2. Đăng nhập

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "an@example.com", "password": "123456" }'
```

Response:

```json
{
  "code": "...",
  "message": "...",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": "…",
      "email": "an@example.com",
      "displayName": "Nguyễn Văn An",
      "avatarUri": null,
      "measurementSystem": "METRIC",
      "themeMode": "SYSTEM"
    }
  }
}
```

Lưu `accessToken` và `refreshToken` (trong React Native nên dùng `expo-secure-store`).

### Bước 3. Gọi API cần đăng nhập

```bash
curl http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOi..."
```

### Bước 4. Làm mới token khi hết hạn

```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "eyJhbGciOi..." }'
```

Trả về cùng cấu trúc với `login` (có `accessToken`, `refreshToken` mới).

### Bước 5. Đăng xuất

```bash
curl -X POST http://localhost:8080/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{ "accessToken": "eyJhbGciOi...", "refreshToken": "eyJhbGciOi..." }'
```

Sau đó xoá token ở máy dù API có thành công hay không.

### Ví dụ thực tế: thêm nguyên liệu vào tủ đồ

```bash
# 1. Tìm nguyên liệu để lấy ingredientId
curl "http://localhost:8080/api/v1/ingredients/search?q=trứng" \
  -H "Authorization: Bearer $TOKEN"

# 2. Thêm vào tủ đồ
curl -X POST http://localhost:8080/api/v1/pantry-items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ingredientId": "<id lấy từ bước 1>",
    "quantity": 10,
    "unit": "PCS",
    "location": "FRIDGE",
    "expiryDate": "2026-11-05"
  }'
```

---

## 3. Các giá trị enum

Gửi lên đúng **chữ HOA** như bảng dưới.

| Enum | Giá trị |
|---|---|
| `unit` (đơn vị) | `MG`, `G`, `KG`, `ML`, `L`, `PCS` (cái), `TBSP` (muỗng canh), `TSP` (muỗng cà phê), `CUP` (cốc), `PINCH` (nhúm) |
| `location` (vị trí trong tủ đồ) | `FRIDGE` (tủ lạnh), `FREEZER` (ngăn đông), `PANTRY_SHELF` (kệ bếp) |
| `difficulty` (độ khó) | `EASY`, `MEDIUM`, `HARD` |
| `mealType` (bữa ăn) | `BREAKFAST`, `LUNCH`, `DINNER` |
| `status` (món mua sắm) | `PENDING` (chưa mua), `BOUGHT` (đã mua) |
| `measurementSystem` | `METRIC`, `IMPERIAL` |
| `themeMode` | `LIGHT`, `DARK`, `SYSTEM` |
| `type` (phản hồi) | `BUG`, `SUGGESTION`, `OTHER` |

Có thể lấy danh sách enum động qua `GET /v1/meta/enums` và `GET /v1/meta/units`.

---

## 4. Danh sách API theo nhóm

**Quy ước đọc bảng:**

- 🔓 = công khai, 🔒 = cần `Authorization: Bearer`.
- `{id}` là tham số nằm trong đường dẫn.
- "Query" là tham số sau dấu `?`.
- **Bắt buộc** là trường phải có, các trường còn lại tuỳ chọn.

### 4.1 Auth — xác thực

| Method | Đường dẫn | Auth | Mô tả | Response |
|---|---|---|---|---|
| POST | `/v1/auth/register` | 🔓 | Đăng ký | 201 `UserResponse` |
| POST | `/v1/auth/login` | 🔓 | Đăng nhập | 200 `AuthenticateResponse` |
| POST | `/v1/auth/refresh-token` | 🔓 | Lấy token mới | 200 `AuthenticateResponse` |
| POST | `/v1/auth/logout` | 🔓 | Đăng xuất | 200 (rỗng) |
| POST | `/v1/auth/introspect` | 🔓 | Kiểm tra token còn hiệu lực | 200 `IntrospectResponse` |
| PATCH | `/v1/auth/forgot-password` | 🔓 | Yêu cầu đặt lại mật khẩu (gửi email) | 204 |
| PATCH | `/v1/auth/reset-password` | 🔓 | Đặt lại mật khẩu bằng token | 204 |
| PATCH | `/v1/auth/change-password` | 🔒 | Đổi mật khẩu | 204 |
| GET | `/v1/auth/test` | ? | Endpoint thử nghiệm, trả chuỗi | 200 string |

**Body:**

`register` (bắt buộc: `email`, `displayName`; trong OpenAPI `password` không bắt buộc nhưng nên luôn gửi)
```json
{ "email": "an@example.com", "password": "123456", "displayName": "Nguyễn Văn An" }
```
Email phải khớp `^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$`.

`login` (bắt buộc cả hai)
```json
{ "email": "an@example.com", "password": "123456" }
```

`refresh-token` (bắt buộc)
```json
{ "refreshToken": "..." }
```

`logout` (bắt buộc cả hai)
```json
{ "accessToken": "...", "refreshToken": "..." }
```

`introspect` (bắt buộc)
```json
{ "accessToken": "..." }
```
Response: `{ active, scope, clientId, userId, exp, iat, sub }`. Dùng trường `active` để biết token còn dùng được không.

`forgot-password`
```json
{ "email": "an@example.com" }
```

`reset-password` (token nhận qua email)
```json
{ "token": "...", "newPassword": "NewPass123!" }
```

`change-password`
```json
{ "oldPassword": "OldPass123!", "newPassword": "NewPass123!" }
```
Sau khi đổi mật khẩu thành công, app hiện tại xoá token và bắt đăng nhập lại.

---

### 4.2 User — người dùng

| Method | Đường dẫn | Auth | Mô tả | Response |
|---|---|---|---|---|
| GET | `/v1/users/me` | 🔒 | Lấy hồ sơ của mình | 200 `UserResponse` |
| PUT | `/v1/users/me` | 🔒 | Cập nhật hồ sơ | 200 `UserResponse` |
| DELETE | `/v1/users/me` | 🔒 | Xoá tài khoản của mình | 204 |
| PUT | `/v1/users/me/avatar` | 🔒 | Đổi ảnh đại diện | 200 `UserResponse` |
| GET | `/v1/users/admin` | 🔒 (admin, *suy ra*) | Danh sách toàn bộ user | 200 phân trang `UserResponse` |

**`PUT /v1/users/me`** — tất cả trường đều tuỳ chọn, chỉ gửi trường muốn đổi:

```json
{
  "displayName": "Tên mới",
  "measurementSystem": "METRIC",
  "themeMode": "DARK"
}
```
`displayName`: 1–100 ký tự, không được toàn khoảng trắng.

**`PUT /v1/users/me/avatar`** — gửi `multipart/form-data` với field tên **`avatar`** (file ảnh):

```bash
curl -X PUT http://localhost:8080/api/v1/users/me/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@./anh.jpg"
```

> Trong OpenAPI, request này được khai báo là `application/json` nhưng field lại là `binary`. Đây là khai báo chưa chuẩn; thực tế phải gửi **multipart** (code client hiện tại cũng gửi multipart).

**`GET /v1/users/admin`** — query: `cursor`, `size` (10–50, mặc định 10), `keyword` (tìm theo từ khoá).

---

### 4.3 Excluded ingredients — nguyên liệu loại trừ

Danh sách nguyên liệu người dùng không ăn được (dị ứng, kiêng).

| Method | Đường dẫn | Auth | Mô tả | Response |
|---|---|---|---|---|
| GET | `/v1/users/me/excluded-ingredients` | 🔒 | Lấy danh sách | 200 `ExcludedIngredientResponse[]` |
| POST | `/v1/users/me/excluded-ingredients` | 🔒 | Thêm | 200 `ExcludedIngredientResponse` |
| DELETE | `/v1/users/me/excluded-ingredients/{id}` | 🔒 | Xoá | 204 |

Body thêm mới (bắt buộc `name`, tối đa 255 ký tự):
```json
{ "name": "Đậu phộng" }
```

---

### 4.4 Recipes — công thức nguồn ngoài

Công thức lấy từ nguồn bên ngoài (định danh bằng `externalId` kiểu string). Tất cả đều 🔒.

| Method | Đường dẫn | Mô tả |
|---|---|---|
| GET | `/v1/recipes/{externalId}` | Chi tiết công thức |
| GET | `/v1/recipes/{externalId}/similar` | Công thức tương tự |
| GET | `/v1/recipes/{externalId}/scale?servings=4` | Chi tiết công thức đã quy đổi số khẩu phần |
| GET | `/v1/recipes/suggestions` | Gợi ý (phân trang) |
| GET | `/v1/recipes/search` | Tìm theo nguyên liệu và bộ lọc (phân trang) |
| GET | `/v1/recipes/by-name?q=phở` | Tìm theo tên (phân trang) |
| GET | `/v1/recipes/popular` | Phổ biến (phân trang) |
| GET | `/v1/recipes/random?count=5` | Ngẫu nhiên, `count` mặc định 5 |

**Query của `/v1/recipes/search`:**

| Query | Kiểu | Ý nghĩa |
|---|---|---|
| `ingredients` | mảng string | Tên các nguyên liệu đang có. Gửi lặp tham số: `?ingredients=trứng&ingredients=hành` |
| `cuisineId` | uuid | Lọc theo ẩm thực |
| `maxMinutes` | int | Thời gian nấu tối đa |
| `difficulty` | enum | `EASY` / `MEDIUM` / `HARD` |
| `cursor`, `size` | | Phân trang (cursor là **string**) |

Kết quả là `RecipeSummaryResponse`, có thêm `usedIngredientCount`, `missedIngredientCount`, `matchScore`, `missingIngredients` để hiển thị mức độ khớp với nguyên liệu bạn có.

```bash
curl "http://localhost:8080/api/v1/recipes/search?ingredients=trứng&ingredients=cà chua&maxMinutes=30&difficulty=EASY&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 4.5 Custom recipes — công thức tự tạo

Công thức do chính người dùng tạo (định danh bằng `id` kiểu uuid).

| Method | Đường dẫn | Auth | Mô tả | Response |
|---|---|---|---|---|
| GET | `/v1/recipes/custom` | 🔒 | Danh sách (phân trang) | 200 phân trang `RecipeSummaryResponse` |
| POST | `/v1/recipes/custom` | 🔒 | Tạo mới | 201 `RecipeDetailResponse` |
| GET | `/v1/recipes/custom/{id}` | 🔒 | Chi tiết | 200 `RecipeDetailResponse` |
| PUT | `/v1/recipes/custom/{id}` | 🔒 | Cập nhật **toàn bộ** | 200 `RecipeDetailResponse` |
| DELETE | `/v1/recipes/custom/{id}` | 🔒 | Xoá | 200 (rỗng) |
| POST | `/v1/recipes/custom/{id}/image` | 🔒 | Upload ảnh món | 200 `RecipeDetailResponse` |

**Body tạo/cập nhật** (`PUT` là **thay thế toàn bộ**, danh sách `ingredients` và `steps` bị ghi đè hoàn toàn, nên luôn gửi đầy đủ):

Bắt buộc: `title`, `servings`, `ingredients`, `steps`.

```json
{
  "title": "Thịt kho tàu",
  "servings": 4,
  "readyInMinutes": 90,
  "difficulty": "MEDIUM",
  "cuisineId": "<uuid lấy từ GET /v1/cuisines>",
  "ingredients": [
    { "name": "Thịt ba chỉ", "amount": 500, "unit": "G" },
    { "name": "Nước mắm" }
  ],
  "steps": [
    { "text": "Ướp thịt với nước mắm và đường trong 15 phút", "timerSeconds": 900 },
    { "text": "Kho nhỏ lửa đến khi thịt mềm" }
  ]
}
```

Giới hạn: `title` ≤ 255 ký tự; `servings` ≤ 100; `ingredients[].name` ≤ 255; `steps[].text` ≤ 5000; tối đa 100 nguyên liệu và 100 bước. Bỏ `amount` nghĩa là "vừa đủ / nêm nếm". Thứ tự bước chính là thứ tự trong mảng `steps`.

**Upload ảnh:** `multipart/form-data`, field tên **`image`**:

```bash
curl -X POST http://localhost:8080/api/v1/recipes/custom/<id>/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@./mon-an.jpg"
```

---

### 4.6 Saved recipes — công thức đã lưu

Công thức người dùng đã lưu, kèm đánh giá, ghi chú, yêu thích.

| Method | Đường dẫn | Auth | Mô tả | Response |
|---|---|---|---|---|
| GET | `/v1/saved-recipes` | 🔒 | Danh sách (phân trang, có lọc) | 200 phân trang `SavedRecipeResponse` |
| POST | `/v1/saved-recipes` | 🔒 | Lưu công thức | 201 `SavedRecipeResponse` |
| GET | `/v1/saved-recipes/{id}` | 🔒 | Chi tiết (kèm công thức đầy đủ) | 200 `SavedRecipeDetailResponse` |
| PATCH | `/v1/saved-recipes/{id}` | 🔒 | Sửa đánh giá/ghi chú/yêu thích | 200 `SavedRecipeResponse` |
| DELETE | `/v1/saved-recipes/{id}` | 🔒 | Bỏ lưu | 204 |

**Query danh sách:** `cursor`, `size` (1–50), `favorite` (true/false), `collectionId` (uuid).

**Lưu công thức** — gửi **một trong hai**: `externalId` (công thức nguồn ngoài) hoặc `recipeId` (công thức đã có trong hệ thống/tự tạo):
```json
{ "externalId": "716429" }
```
hoặc
```json
{ "recipeId": "550e8400-e29b-41d4-a716-446655440000" }
```

**Sửa** (tất cả tuỳ chọn):
```json
{ "rating": 5, "note": "Nấu thêm tiêu cho thơm", "favorite": true }
```
`rating`: 1–5. `note` ≤ 2000 ký tự.

> `{id}` ở đây là **id của bản ghi đã lưu** (`SavedRecipeResponse.id`), không phải id công thức.

---

### 4.7 Collections — bộ sưu tập

Nhóm các công thức đã lưu vào bộ sưu tập (ví dụ "Món nhậu", "Ăn kiêng").

| Method | Đường dẫn | Auth | Mô tả | Response |
|---|---|---|---|---|
| GET | `/v1/collections` | 🔒 | Danh sách | 200 `CollectionResponse[]` |
| POST | `/v1/collections` | 🔒 | Tạo | 201 `CollectionResponse` |
| PUT | `/v1/collections/{id}` | 🔒 | Đổi tên | 200 `CollectionResponse` |
| DELETE | `/v1/collections/{id}` | 🔒 | Xoá | 204 |
| POST | `/v1/collections/{id}/recipes/{savedRecipeId}` | 🔒 | Thêm công thức đã lưu vào bộ sưu tập | 200 `CollectionResponse` |
| DELETE | `/v1/collections/{id}/recipes/{savedRecipeId}` | 🔒 | Bỏ công thức khỏi bộ sưu tập | 200 `CollectionResponse` |

Body tạo/đổi tên (bắt buộc `name`, ≤ 100 ký tự):
```json
{ "name": "Món nhậu" }
```

`savedRecipeId` là `id` của bản ghi trong [Saved recipes](#46-saved-recipes--công-thức-đã-lưu). Response `CollectionResponse` có `recipeCount`.

---

### 4.8 Pantry — tủ đồ

Quản lý nguyên liệu đang có trong nhà.

| Method | Đường dẫn | Auth | Mô tả | Response |
|---|---|---|---|---|
| GET | `/v1/pantry-items` | 🔒 | Danh sách (phân trang, có lọc) | 200 phân trang `PantryItemResponse` |
| POST | `/v1/pantry-items` | 🔒 | Thêm một món | 200 `PantryItemResponse` |
| POST | `/v1/pantry-items/batch` | 🔒 | Thêm nhiều món một lần | 200 `PantryItemResponse[]` |
| GET | `/v1/pantry-items/{id}` | 🔒 | Chi tiết | 200 `PantryItemResponse` |
| PUT | `/v1/pantry-items/{id}` | 🔒 | Cập nhật | 200 `PantryItemResponse` |
| DELETE | `/v1/pantry-items/{id}` | 🔒 | Xoá | 200 (rỗng) |
| POST | `/v1/pantry-items/{id}/consume` | 🔒 | Dùng bớt một lượng | 200 `PantryItemResponse` |
| POST | `/v1/pantry-items/{id}/photo` | 🔒 | Upload ảnh | 200 `PantryItemResponse` |
| GET | `/v1/pantry-items/expiring?days=3` | 🔒 | Món sắp hết hạn trong N ngày (mặc định 3) | 200 `PantryItemResponse[]` |

**Query danh sách:** `cursor`, `size`, `categoryId` (uuid), `location` (`FRIDGE`/`FREEZER`/`PANTRY_SHELF`), `keyword`.

**Thêm một món** (bắt buộc: `ingredientId`, `quantity`, `unit`):
```json
{
  "ingredientId": "550e8400-e29b-41d4-a716-446655440000",
  "quantity": 10,
  "unit": "PCS",
  "location": "FRIDGE",
  "expiryDate": "2026-11-05",
  "photoUri": "https://..."
}
```

**Thêm nhiều món** (bắt buộc `items`, mỗi phần tử có cấu trúc như trên):
```json
{ "items": [ { "ingredientId": "...", "quantity": 2, "unit": "KG" } ] }
```

**Cập nhật** (bắt buộc `quantity`, `unit`; **không** đổi được `ingredientId`):
```json
{ "quantity": 8, "unit": "PCS", "location": "FREEZER", "expiryDate": "2026-12-01" }
```

**Dùng bớt** (bắt buộc `quantity`):
```json
{ "quantity": 2 }
```

**Upload ảnh:** `multipart/form-data`, field **`image`**.

---

### 4.9 Ingredients / Categories / Cuisines

Dữ liệu danh mục dùng chung. Các API đọc (GET) dùng cho mọi user. Các API ghi (POST/PUT/DELETE) nhiều khả năng chỉ dành cho admin, nhưng OpenAPI không nói rõ, hãy kiểm tra khi gọi.

#### Ingredients — nguyên liệu

| Method | Đường dẫn | Mô tả | Response |
|---|---|---|---|
| GET | `/v1/ingredients/search` | Tìm nguyên liệu (phân trang) | 200 phân trang `IngredientResponse` |
| GET | `/v1/ingredients/{id}` | Chi tiết | 200 `IngredientResponse` |
| GET | `/v1/ingredients/barcode/{code}` | Tìm theo mã vạch | 200 `IngredientResponse` |
| POST | `/v1/ingredients` | Tạo | 201 `IngredientResponse` |
| PUT | `/v1/ingredients/{id}` | Sửa | 200 `IngredientResponse` |
| DELETE | `/v1/ingredients/{id}` | Xoá | 204 |

Query `search`: `q` (từ khoá), `categoryId`, `cursor`, `size` (mặc định 20).

Body tạo/sửa (bắt buộc `name`, `categoryId`):
```json
{
  "name": "Đường",
  "defaultUnit": "G",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "barcode": "1234567890123"
}
```
`barcode` chỉ gồm chữ số, dài 8–14 ký tự.

#### Ingredient categories — nhóm nguyên liệu

| Method | Đường dẫn | Mô tả | Response |
|---|---|---|---|
| GET | `/v1/ingredient-categories` | Danh sách | 200 `IngredientCategoryResponse[]` |
| POST | `/v1/ingredient-categories` | Tạo | 201 |
| PUT | `/v1/ingredient-categories/{id}` | Sửa | 200 |
| DELETE | `/v1/ingredient-categories/{id}` | Xoá | 204 |

Body (bắt buộc `code`, `name`):
```json
{ "code": "SPICE_HERB", "name": "Gia vị và thảo mộc" }
```
`code`: chữ HOA, số, gạch dưới, bắt đầu bằng chữ cái, dài 2–50 ký tự.

#### Cuisines — ẩm thực

| Method | Đường dẫn | Mô tả | Response |
|---|---|---|---|
| GET | `/v1/cuisines` | Danh sách | 200 `CuisineResponse[]` |
| POST | `/v1/cuisines` | Tạo | 201 |
| PUT | `/v1/cuisines/{id}` | Sửa | 200 |
| DELETE | `/v1/cuisines/{id}` | Xoá | 204 |

Body (bắt buộc `code`, `name`):
```json
{ "code": "JAPANESE", "name": "Nhật Bản" }
```
`code`: chỉ chữ HOA, số, gạch dưới (≤ 50 ký tự). `name` ≤ 100 ký tự.

---

### 4.10 Shopping lists — danh sách mua sắm

| Method | Đường dẫn | Auth | Mô tả | Response |
|---|---|---|---|---|
| GET | `/v1/shopping-lists` | 🔒 | Danh sách (phân trang) | 200 phân trang `ShoppingListResponse` |
| POST | `/v1/shopping-lists` | 🔒 | Tạo danh sách | 201 `ShoppingListResponse` |
| GET | `/v1/shopping-lists/{id}` | 🔒 | Chi tiết (kèm các món) | 200 `ShoppingListDetailResponse` |
| PUT | `/v1/shopping-lists/{id}` | 🔒 | Đổi tên | 200 `ShoppingListResponse` |
| DELETE | `/v1/shopping-lists/{id}` | 🔒 | Xoá | 204 |
| POST | `/v1/shopping-lists/{listId}/items` | 🔒 | Thêm món | 201 `ShoppingItemResponse` |
| PATCH | `/v1/shopping-lists/{listId}/items/{itemId}` | 🔒 | Sửa món | 200 `ShoppingItemResponse` |
| DELETE | `/v1/shopping-lists/{listId}/items/{itemId}` | 🔒 | Xoá món | 204 |

Body tạo/đổi tên danh sách (bắt buộc `name`, ≤ 255 ký tự):
```json
{ "name": "Đi chợ cuối tuần" }
```

Body thêm món (bắt buộc `name`):
```json
{ "name": "Trứng gà", "quantity": 10, "unit": "PCS" }
```

Body sửa món: **cả 4 trường đều bắt buộc**, thiếu hoặc `null` là bị từ chối. Dù chỉ muốn đánh dấu "đã mua", vẫn phải gửi đủ:
```json
{ "name": "Trứng gà", "quantity": 10, "unit": "PCS", "status": "BOUGHT" }
```

---

### 4.11 Meal plans — kế hoạch bữa ăn

| Method | Đường dẫn | Auth | Mô tả | Response |
|---|---|---|---|---|
| GET | `/v1/meal-plans?weekStart=2026-10-26` | 🔒 | Lấy kế hoạch theo tuần (`weekStart` bắt buộc) | 200 `MealPlanResponse` |
| POST | `/v1/meal-plans` | 🔒 | Tạo kế hoạch | 201 `MealPlanResponse` |
| GET | `/v1/meal-plans/{id}` | 🔒 | Chi tiết | 200 `MealPlanResponse` |
| DELETE | `/v1/meal-plans/{id}` | 🔒 | Xoá | 204 |
| POST | `/v1/meal-plans/{id}/copy?toWeekStart=2026-11-02` | 🔒 | Sao chép sang tuần khác (`toWeekStart` bắt buộc) | 200 `MealPlanResponse` |
| POST | `/v1/meal-plans/{id}/entries` | 🔒 | Thêm bữa ăn | 201 `MealPlanEntryResponse` |
| PATCH | `/v1/meal-plans/{id}/entries/{entryId}` | 🔒 | Sửa bữa ăn | 200 `MealPlanEntryResponse` |
| DELETE | `/v1/meal-plans/{id}/entries/{entryId}` | 🔒 | Xoá bữa ăn | 204 |
| GET | `/v1/meal-plans/{id}/shopping-list` | 🔒 | Xem trước danh sách mua sắm cần cho cả kế hoạch | 200 `ShoppingItemResponse[]` |

**Tạo kế hoạch** (bắt buộc `weekStart`, kiểu `date`):
```json
{
  "weekStart": "2026-10-26",
  "entries": [
    { "date": "2026-10-26", "mealType": "LUNCH", "recipeId": "<uuid>", "servings": 2 }
  ]
}
```

**Thêm bữa ăn** (bắt buộc `date`, `mealType`; `recipeId` tuỳ chọn):
```json
{ "date": "2026-10-27", "mealType": "DINNER", "recipeId": "<uuid>", "servings": 3 }
```

**Sửa bữa ăn** (tất cả tuỳ chọn):
```json
{ "date": "2026-10-28", "mealType": "LUNCH", "servings": 4, "cooked": true }
```

> `recipeId` ở đây là **uuid** nội bộ (`RecipeDetailResponse.id`), không phải `externalId`.

---

### 4.12 AI

Tất cả đều 🔒 và dùng `POST`.

| Đường dẫn | Mô tả | Response |
|---|---|---|
| `/v1/ai/recognize` | Nhận diện nguyên liệu từ **ảnh** | 200 `RecognizedIngredientResponse[]` |
| `/v1/ai/recipe-ideas` | Gợi ý món ăn từ nguyên liệu đang có | 200 `RecipeIdeaResponse[]` |
| `/v1/ai/substitutions` | Gợi ý nguyên liệu thay thế | 200 `SubstitutionResponse[]` |
| `/v1/ai/meal-plan` | AI soạn nháp kế hoạch bữa ăn | 200 `MealPlanResponse` |
| `/v1/ai/adapt-recipe` | Điều chỉnh công thức để tránh nguyên liệu loại trừ | 200 `RecipeDetailResponse` |

**`/v1/ai/recognize`** — `multipart/form-data`, field **`image`**. Trả về mỗi nguyên liệu có `name`, `nameEn`, `confidence` (0–1), `quantityHint`.

**`/v1/ai/recipe-ideas`** (tất cả tuỳ chọn):
```json
{ "limit": 5, "maxCookingMinutes": 30, "cuisine": "Italian" }
```
`limit`: 1–10. `maxCookingMinutes`: 5–480.

**`/v1/ai/substitutions`** (bắt buộc `missingIngredient`; gửi `recipeTitle` **hoặc** `recipeId` để cung cấp ngữ cảnh, `recipeTitle` được ưu tiên):
```json
{ "recipeTitle": "Phở bò", "missingIngredient": "Bơ" }
```
Response mỗi phần tử: `name`, `ratio` (ví dụ `"1:1"`), `note`, `confidence`.

**`/v1/ai/meal-plan`** (bắt buộc `weekStart`):
```json
{ "weekStart": "2026-10-26T00:00:00Z", "days": 7, "cuisineId": "<uuid>", "maxMinutes": 45 }
```
Lưu ý `weekStart` ở API này là **`date-time`**, khác với `meal-plans` dùng `date`. `days`: 1–7. Kết quả là bản **nháp**, bạn cần gọi `POST /v1/meal-plans` nếu muốn lưu.

**`/v1/ai/adapt-recipe`** (bắt buộc `recipeId`):
```json
{ "recipeId": "550e8400-e29b-41d4-a716-446655440000" }
```

Các API AI có thể chậm hơn bình thường, nên đặt timeout lớn (ví dụ 30–60 giây) và hiển thị trạng thái đang xử lý.

---

### 4.13 Khác: stats, meta, units, sync, feedback

| Method | Đường dẫn | Auth | Mô tả | Response |
|---|---|---|---|---|
| GET | `/v1/stats/me` | 🔒 | Thống kê của tôi | 200 `UserStatsResponse` |
| GET | `/v1/meta/enums` | ? | Toàn bộ danh sách enum | 200 `MetaEnumsResponse` |
| GET | `/v1/meta/units` | ? | Danh sách đơn vị | 200 `string[]` |
| GET | `/v1/units/convert` | ? | Quy đổi đơn vị | 200 `UnitConvertResponse` |
| GET | `/v1/sync-statuses` | ? | Danh sách trạng thái đồng bộ | 200 `SyncStatusResponse[]` |
| POST | `/v1/feedback` | 🔒 | Gửi phản hồi | 204 |
| GET | `/v1/feedback` | 🔒 (admin, *suy ra*) | Xem phản hồi (phân trang) | 200 phân trang `FeedbackResponse` |

**`/v1/stats/me`** trả: `savedRecipeCount`, `collectionCount`, `cookedCount`, `wastedItemCount`.

**`/v1/units/convert`** — query bắt buộc cả ba: `value` (≥ 0), `from`, `to` (enum `unit`):
```bash
curl "http://localhost:8080/api/v1/units/convert?value=500&from=G&to=KG"
```
Kết quả: `{ "value": 500, "from": "G", "to": "KG", "result": 0.5 }`.

**`POST /v1/feedback`** (bắt buộc `type`, `message` ≤ 2000 ký tự):
```json
{
  "type": "BUG",
  "message": "App bị đơ khi đổi ảnh đại diện",
  "appVersion": "1.0.3",
  "deviceInfo": "Pixel 7 / Android 14"
}
```

**`GET /v1/feedback`** — query: `cursor`, `size` (1–30), `keyword`, `type` (`BUG`/`SUGGESTION`/`OTHER`).

---

## 5. Tham chiếu cấu trúc dữ liệu

### UserResponse
```json
{
  "id": "uuid",
  "email": "string",
  "displayName": "string",
  "avatarUri": "string",
  "measurementSystem": "METRIC | IMPERIAL",
  "themeMode": "LIGHT | DARK | SYSTEM"
}
```

### AuthenticateResponse
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "tokenType": "string",
  "expiresIn": 3600,
  "user": { "...UserResponse" }
}
```

### RecipeDetailResponse
```json
{
  "id": "uuid",
  "externalId": "string",
  "title": "string",
  "imageUrl": "string",
  "servings": 4,
  "readyInMinutes": 90,
  "difficulty": "EASY | MEDIUM | HARD",
  "sourceUrl": "string",
  "custom": false,
  "cuisine": { "id": "uuid", "code": "string", "name": "string" },
  "ingredients": [ { "id": "uuid", "name": "string", "amount": 500, "unit": "G" } ],
  "steps": [ { "id": "uuid", "stepOrder": 1, "text": "string", "timerSeconds": 900 } ],
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```
`custom = true` nghĩa là công thức do người dùng tự tạo.

### RecipeSummaryResponse (dùng trong danh sách)
`id`, `externalId`, `title`, `imageUrl`, `servings`, `readyInMinutes`, `difficulty`, `custom`, `cuisine`, cùng các trường chỉ có khi tìm theo nguyên liệu: `usedIngredientCount`, `missedIngredientCount`, `matchScore`, `missingIngredients[]`.

### SavedRecipeResponse
```json
{ "id": "uuid", "recipeId": "uuid", "recipeTitle": "string", "rating": 5, "note": "string", "favorite": true }
```

### SavedRecipeDetailResponse
`id`, `rating`, `note`, `favorite`, và `recipe` (một `RecipeDetailResponse` đầy đủ).

### CollectionResponse
```json
{ "id": "uuid", "name": "string", "recipeCount": 12 }
```

### PantryItemResponse
```json
{
  "id": "uuid",
  "ingredientId": "uuid",
  "ingredientName": "string",
  "categoryId": "uuid",
  "categoryName": "string",
  "quantity": 10,
  "unit": "PCS",
  "location": "FRIDGE",
  "expiryDate": "2026-11-05",
  "photoUri": "string",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

### IngredientResponse
```json
{
  "id": "uuid",
  "name": "string",
  "defaultUnit": "G",
  "barcode": "string",
  "category": { "id": "uuid", "code": "string", "name": "string" }
}
```

### ShoppingListResponse / ShoppingListDetailResponse / ShoppingItemResponse
```json
{ "id": "uuid", "name": "string" }
```
`ShoppingListDetailResponse` thêm `items: ShoppingItemResponse[]`.
```json
{ "id": "uuid", "name": "string", "quantity": 10, "unit": "PCS", "status": "PENDING | BOUGHT" }
```

### MealPlanResponse / MealPlanEntryResponse
```json
{
  "id": "uuid",
  "weekStart": "2026-10-26",
  "entries": [
    {
      "id": "uuid",
      "date": "2026-10-27",
      "mealType": "DINNER",
      "recipeId": "uuid",
      "recipeTitle": "string",
      "recipeImageUrl": "string",
      "servings": 3,
      "cooked": false,
      "createdAt": "date-time",
      "updatedAt": "date-time"
    }
  ],
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

### Các kiểu khác
| Kiểu | Trường |
|---|---|
| `ExcludedIngredientResponse` | `id`, `name` |
| `CuisineResponse` | `id`, `code`, `name` |
| `IngredientCategoryResponse` | `id`, `code`, `name` |
| `SyncStatusResponse` | `id`, `code`, `name` |
| `UserStatsResponse` | `savedRecipeCount`, `collectionCount`, `cookedCount`, `wastedItemCount` |
| `RecipeIdeaResponse` | `name`, `description`, `estimatedMinutes`, `usedIngredients[]`, `missingIngredients[]`, `confidence` |
| `SubstitutionResponse` | `name`, `ratio`, `note`, `confidence` |
| `RecognizedIngredientResponse` | `name`, `nameEn`, `confidence`, `quantityHint` |
| `FeedbackResponse` | `id`, `type`, `message`, `appVersion`, `deviceInfo`, `createdAt`, `user` (`UserInfo`) |
| `UserInfo` | `id`, `email`, `displayName`, `avatarUrl` *(lưu ý: `avatarUrl`, khác `avatarUri` của `UserResponse`)* |
| `MetaEnumsResponse` | `unit[]`, `mealType[]`, `difficulty[]`, `storageLocation[]`, `shoppingItemStatus[]`, `measurementSystem[]`, `themeMode[]` |

---

## 6. Mẫu code client (axios)

### 6.1 Tạo hai instance: công khai và có token

```ts
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

// Dùng cho login / register / refresh / forgot-password ...
export const publicHttp = axios.create({ baseURL: BASE_URL, timeout: 15000 });

// Dùng cho mọi API cần đăng nhập
export const privateHttp = axios.create({ baseURL: BASE_URL, timeout: 15000 });

privateHttp.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### 6.2 Tự động refresh token khi gặp 401

```ts
let refreshing: Promise<string> | null = null;

privateHttp.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) throw error;
    original._retry = true;

    // Gộp nhiều request cùng hết hạn thành một lần refresh
    refreshing ??= (async () => {
      const refreshToken = await tokenStorage.getRefreshToken();
      const { data } = await publicHttp.post("/v1/auth/refresh-token", { refreshToken });
      await tokenStorage.saveAccessToken(data.data.accessToken);
      await tokenStorage.saveRefreshToken(data.data.refreshToken);
      return data.data.accessToken as string;
    })().finally(() => (refreshing = null));

    const newToken = await refreshing;
    original.headers.Authorization = `Bearer ${newToken}`;
    return privateHttp(original);
  },
);
```

Nếu bước refresh cũng lỗi, xoá token và đưa người dùng về màn hình đăng nhập.

### 6.3 Hàm bóc `data`

```ts
interface ApiResponse<T> { code: string; message: string; data: T }

async function unwrap<T>(p: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  return (await p).data.data;
}

// Dùng
const me = await unwrap(privateHttp.get<ApiResponse<UserResponse>>("/v1/users/me"));
```

### 6.4 Upload ảnh (React Native + web)

```ts
import { Platform } from "react-native";

async function uploadAvatar(image: { uri: string; fileName?: string; mimeType?: string }) {
  const name = image.fileName ?? "avatar.jpg";
  const type = image.mimeType ?? "image/jpeg";
  const form = new FormData();

  if (Platform.OS === "web") {
    const blob = await (await fetch(image.uri)).blob(); // web cần Blob thật
    form.append("avatar", blob, name);
  } else {
    form.append("avatar", { uri: image.uri, name, type } as unknown as Blob);
  }

  return unwrap(
    privateHttp.put<ApiResponse<UserResponse>>("/v1/users/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    }),
  );
}
```
Đổi tên field thành `image` khi upload ảnh công thức, ảnh tủ đồ hoặc ảnh cho AI nhận diện.

### 6.5 Duyệt hết các trang (cursor)

```ts
async function fetchAll<T>(path: string, params: Record<string, unknown> = {}) {
  const all: T[] = [];
  let cursor: string | undefined;
  do {
    const page = await unwrap(
      privateHttp.get<ApiResponse<{ content: T[]; hasNext: boolean; nextCursor?: string }>>(path, {
        params: { ...params, cursor, size: 50 },
      }),
    );
    all.push(...page.content);
    cursor = page.hasNext ? page.nextCursor : undefined;
  } while (cursor);
  return all;
}
```
Trong app thực tế, nên tải từng trang khi người dùng cuộn (infinite scroll) thay vì tải hết.

### 6.6 Gửi mảng trong query (`ingredients`)

Axios mặc định gửi `ingredients[]=a&ingredients[]=b`. API này cần `ingredients=a&ingredients=b`, nên dùng:

```ts
privateHttp.get("/v1/recipes/search", {
  params: { ingredients: ["trứng", "cà chua"], maxMinutes: 30 },
  paramsSerializer: { indexes: null },
});
```

---

## 7. Lưu ý và điểm cần kiểm tra

1. **Khớp cách bóc `data`.** Theo OpenAPI, *mọi* API đều bọc trong `{ code, message, data }`. Trong code client hiện có, `login`/`getMe` đọc `response.data` trực tiếp còn `updateMe` đọc `data.data`. Hai cách này không thể cùng đúng nếu không có interceptor xử lý. Nếu một nơi bóc thiếu, kết quả sẽ là object có `code`/`message`/`data` thay vì `UserResponse` (hậu quả thường thấy: email, avatar hiện trống sau khi cập nhật). Nên thống nhất một hàm `unwrap` như mục 6.3 cho toàn bộ repository.
2. **Tên trường avatar khác nhau:** `UserResponse.avatarUri` nhưng `UserInfo.avatarUrl` (trong phản hồi của admin).
3. **Hai loại id công thức:** `externalId` (string, công thức nguồn ngoài) và `id` (uuid). Meal plan, saved recipe, AI dùng uuid. `GET /v1/recipes/{externalId}` dùng `externalId`.
4. **`PUT` thay thế toàn bộ** với công thức tự tạo (`ingredients`, `steps` bị ghi đè). `PATCH` mới là sửa một phần (saved recipe, meal plan entry, shopping item). Riêng shopping item dù là `PATCH` vẫn bắt buộc đủ 4 trường.
5. **`weekStart` kiểu khác nhau:** `date` (`2026-10-26`) ở `/v1/meal-plans`, nhưng `date-time` ở `/v1/ai/meal-plan`.
6. **Mã trả về không đồng nhất:** một số `DELETE` trả `204` (không body), một số trả `200` kèm `ApiResponseVoid` (`custom recipe`, `pantry item`). Đừng giả định luôn có hoặc luôn không có body khi xoá.
7. **Chưa có trong OpenAPI, nên xác nhận với backend:**
   - Định dạng body lỗi (`400`/`401`/`403`/`404`).
   - API nào cần quyền admin (đặc biệt `POST/PUT/DELETE` của `ingredients`, `ingredient-categories`, `cuisines`, và `GET /v1/feedback`, `GET /v1/users/admin`).
   - Thời hạn thực tế của `accessToken` / `refreshToken`.
   - Giới hạn kích thước và định dạng ảnh được chấp nhận khi upload.
8. **Môi trường chạy:** `localhost` chỉ đúng khi test từ chính máy chạy server (xem mục 1.1). Android cleartext HTTP có thể bị chặn từ Android 9, khi đó cần bật `usesCleartextTraffic` hoặc dùng HTTPS.
