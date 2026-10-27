# Hướng dẫn viết một feature mới (theo mẫu `auth`)

Tài liệu này hướng dẫn cách viết code cho một feature mới sao cho **giống hệt cách feature `auth` đang làm**: cùng cách đặt tên file, cùng cách chia lớp, dùng hook cho giao diện, và **không để logic trong màn hình**.

Ví dụ xuyên suốt dùng feature **`pantry`** (tủ đồ), vì API của nó có trong `API_DOCUMENTATION.md`. Khi làm feature khác (`recipes`, `shoppingLists`, `mealPlans`...) chỉ cần đổi tên tương ứng.

> Ghi chú: file `pantry-chef` bạn tải lên có kích thước 0 byte nên mình không đọc được cấu trúc toàn project. Các đường dẫn như `@/core/di/container`, `@/store/hooks`, `@/types`, `@/components/ui/*` được lấy từ các import thực tế trong code `auth` và màn hình `ProfileScreen`.

---

## Mục lục

1. [Nguyên tắc cốt lõi](#1-nguyên-tắc-cốt-lõi)
2. [Cấu trúc thư mục](#2-cấu-trúc-thư-mục)
3. [Quy tắc đặt tên](#3-quy-tắc-đặt-tên)
4. [Vai trò từng file](#4-vai-trò-từng-file)
5. [Hướng dẫn từng bước: tạo feature `pantry`](#5-hướng-dẫn-từng-bước-tạo-feature-pantry)
6. [Quy tắc "không để logic ở giao diện"](#6-quy-tắc-không-để-logic-ở-giao-diện)
7. [Checklist khi tạo feature mới](#7-checklist-khi-tạo-feature-mới)
8. [Những lỗi hay gặp](#8-những-lỗi-hay-gặp)
9. [Check-list](https://docs.google.com/spreadsheets/d/1HmieTUfW35F5_HqBuvUoSc4XbiXn6sNxhFMlXVPuN0o/edit?usp=sharing)
10. [Phân công](./PHAN_CONG_CHI_TIET.md)
---
**Sau khi làm xong api nào thì vào checklist đánh dấu**
**Colors dùng ở file [colors.js](src/core/theme/colors.js)**
---

## 1. Nguyên tắc cốt lõi

Dữ liệu đi **một chiều** qua các lớp. Lớp trên chỉ biết lớp ngay bên dưới:

```
Screen (app/…)            chỉ hiển thị, gọi hàm của hook
   │
   ▼
Hook  (useXxx.ts)         đọc state từ Redux, trả về hàm cho màn hình
   │
   ▼
Slice (xxxSlice.ts)       state + thunk (điều phối: gọi service, dispatch kết quả)
   │
   ▼
Service (xxxService.ts)   nghiệp vụ (lưu token, xoá token, ghép nhiều bước)
   │
   ▼
Repository (httpXxxRepository.ts)   gọi HTTP, trả về đúng kiểu DTO
```

Ba điều bắt buộc:

1. **Màn hình không gọi API, không `import` axios, không viết logic nghiệp vụ.** Màn hình chỉ gọi hàm lấy từ hook.
2. **Service phụ thuộc vào interface, không phụ thuộc vào class cụ thể.** Interface (`IXxx`) nằm trong `types.ts`, class HTTP chỉ là một cách hiện thực. Nhờ vậy dễ thay thế và dễ test.
3. **Việc ghép các object với nhau (new Service, new Repository) chỉ làm ở một nơi:** `@/core/di/container`.

---

## 2. Cấu trúc thư mục

Mỗi feature là **một thư mục phẳng** trong `features/`, không chia nhỏ thêm thư mục con (đúng như `auth`):

```
features/
├── auth/
│   ├── types.ts                 # Interface: IAuthenticator, IPasswordRecovery, IUserApi
│   ├── httpAuthRepository.ts    # Gọi API đăng nhập/đăng ký/đổi mật khẩu
│   ├── httpUserRepository.ts    # Gọi API hồ sơ người dùng
│   ├── authService.ts           # Nghiệp vụ auth (lưu/xoá token, restore session)
│   ├── userService.ts           # Nghiệp vụ user
│   ├── authSlice.ts             # Redux: state + thunk
│   ├── userActions.ts           # Thunk cho user (dùng chung state của authSlice)
│   ├── useAuth.ts               # Hook cho màn hình
│   ├── useUser.ts               # Hook cho màn hình
│   ├── validation.ts            # Hàm kiểm tra dữ liệu nhập
│   └── onboardingFlag.ts        # Hằng số
│
└── pantry/                      # ← feature mới, cùng kiểu
    ├── types.ts
    ├── httpPantryRepository.ts
    ├── pantryService.ts
    ├── pantrySlice.ts
    ├── usePantry.ts
    ├── usePantryForm.ts         # hook xử lý form (logic của màn hình thêm/sửa)
    └── validation.ts
```

Màn hình nằm ở `app/` (Expo Router), **không** nằm trong `features/`:

```
app/
└── (tabs)/pantry.tsx            # chỉ render UI
```

Component dùng chung (nút, thẻ, ô nhập…) nằm ở `@/components/ui/`. Kiểu dữ liệu dùng chung (DTO của API) nằm ở `@/types`.

---

## 3. Quy tắc đặt tên

### 3.1 Tên file

| Loại file | Mẫu tên | Ví dụ (auth) | Ví dụ (pantry) |
|---|---|---|---|
| Interface của feature | `types.ts` | `types.ts` | `types.ts` |
| Repository gọi HTTP | `http<Tên>Repository.ts` | `httpAuthRepository.ts` | `httpPantryRepository.ts` |
| Service | `<tên>Service.ts` | `authService.ts` | `pantryService.ts` |
| Redux slice | `<tên>Slice.ts` | `authSlice.ts` | `pantrySlice.ts` |
| Hook | `use<Tên>.ts` | `useAuth.ts`, `useUser.ts` | `usePantry.ts`, `usePantryForm.ts` |
| Hàm kiểm tra dữ liệu | `validation.ts` | `validation.ts` | `validation.ts` |
| Hằng số | `<tên>Flag.ts` / `<tên>.ts` | `onboardingFlag.ts` | `pantryLocations.ts` |

Quy tắc chung:

- **File `.ts` viết `camelCase`**, bắt đầu bằng chữ thường (`authService.ts`, không phải `AuthService.ts`).
- Hook **luôn bắt đầu bằng `use`**.
- Chỉ file **component giao diện** (`.tsx`) mới đặt `PascalCase` (ví dụ `ProfileScreen`, `Button`).
- Không dùng hậu tố mơ hồ như `utils.ts`, `helpers.ts`, `common.ts`. Hãy đặt tên theo việc nó làm (`validation.ts`).

### 3.2 Tên bên trong file

| Thứ | Quy tắc | Ví dụ |
|---|---|---|
| Class | `PascalCase` | `AuthService`, `HttpAuthRepository`, `UserService` |
| Interface | `PascalCase`, **bắt đầu bằng `I`** | `IAuthenticator`, `IUserApi`, `IPasswordRecovery` |
| Type / DTO | `PascalCase` | `UserResponse`, `LoginRequest`, `AuthStatus` |
| Thunk | `camelCase`, là **động từ** | `signIn`, `signOut`, `restoreSession`, `refreshUser` |
| Action của reducer | `camelCase`, là **sự kiện đã xảy ra** (quá khứ) | `authenticated`, `unauthenticated` |
| Hook | `useXxx` | `useAuth`, `useUser` |
| Hằng số | `SCREAMING_SNAKE_CASE` | `ONBOARDING_KEY` |
| Biến kiểm tra | `camelCase` trong một object | `validators.email`, `validators.password` |

Cách đặt tên interface theo **vai trò** (không theo công nghệ):

- `IAuthenticator` (đăng nhập/đăng ký/đăng xuất), `IPasswordRecovery` (quên/đặt lại/đổi mật khẩu), `IUserApi` (hồ sơ).
- Một class repository có thể `implements` nhiều interface nhỏ (xem `HttpAuthRepository implements IAuthenticator, IPasswordRecovery`). Ưu tiên **nhiều interface nhỏ** hơn một interface to.

Với `pantry`: `IPantryApi`, và nếu cần tách thêm thì `IPantryPhotoApi`.

### 3.3 Đặt tên alias import

Luôn import bằng alias `@/`, không dùng đường dẫn tương đối nhiều cấp:

```ts
import { authService } from "@/core/di/container";   // đúng
import { authService } from "../../../core/di/container"; // sai
```

Chỉ dùng đường dẫn tương đối `./` khi import file **cùng thư mục feature** (như `import { signIn } from './authSlice'`).

---

## 4. Vai trò từng file

### `types.ts` — hợp đồng của feature

Chỉ chứa **interface**. Không chứa code chạy.

```ts
// features/auth/types.ts (rút gọn)
export interface IUserApi {
  getMe(): Promise<UserResponse>;
  updateMe(body: UserUpdateRequest): Promise<UserResponse>;
  updateAvatar(image: PickedImage): Promise<UserResponse>;
  deleteMe(): Promise<void>;
}
```

### `http<Tên>Repository.ts` — nói chuyện với server

- Là **class**, nhận `AxiosInstance` qua constructor (`publicHttp` hoặc `privateHttp`).
- Các hàm viết dạng **arrow function property** (`login = async (…) => {…}`) để tránh mất `this` khi truyền hàm đi.
- Mỗi hàm gọi **đúng một endpoint**, trả về **đúng kiểu DTO**. Không lưu token, không dispatch, không hiện thông báo.
- API công khai dùng `publicHttp`, API cần đăng nhập dùng `privateHttp`.

### `<tên>Service.ts` — nghiệp vụ

- Là **class**, nhận **interface** qua constructor (không nhận class HTTP cụ thể).
- Chứa các quyết định nghiệp vụ: "đăng nhập xong thì lưu token", "đổi mật khẩu xong thì xoá token", "restore thất bại thì xoá token".
- Service **không biết Redux, không biết React**.
- Nếu một hàm chỉ chuyển tiếp xuống repository mà không làm gì thêm (như `UserService`), vẫn giữ lớp này để mọi feature có cùng hình dạng.

### `<tên>Slice.ts` — state và thunk

- Chứa **state** của feature, reducer và **thunk**.
- Thunk dùng **hàm thường** (`AppThunk`), **không dùng `createAsyncThunk`**, để lỗi gốc (`ApiError`/`AxiosError`) được ném nguyên cho hook/màn hình, không bị biến thành `SerializedError`.
- Thunk trả về `Promise<void>` (hoặc `Promise<kết quả>`) và **ném lỗi lên trên**; không tự `Alert`.
- Thunk lấy service từ `@/core/di/container`, không tự `new`.

### `use<Tên>.ts` — cầu nối với giao diện

- Đọc state bằng `useAppSelector`, gửi thunk bằng `useAppDispatch` (cả hai từ `@/store/hooks`).
- Trả về một object gồm **dữ liệu** và **hàm hành động** đã được bọc sẵn `dispatch`.
- Bọc hàm bằng `useCallback` / kết quả bằng `useMemo` để màn hình không bị render thừa và không rơi vào vòng lặp `useEffect`.
- Màn hình **không** import trực tiếp từ `xxxSlice.ts`; chỉ import hook.

### `validation.ts` — kiểm tra dữ liệu nhập

- Mỗi validator nhận giá trị, trả về `null` nếu hợp lệ hoặc **chuỗi thông báo lỗi** nếu sai (đúng như `validators.email`).
- Hàm thuần, không phụ thuộc React.

---

## 5. Hướng dẫn từng bước: tạo feature `pantry`

Làm theo đúng thứ tự từ dưới lên: **types → repository → service → DI → slice → store → hook → màn hình**.

### Bước 1. Khai báo DTO trong `@/types`

Lấy từ `API_DOCUMENTATION.md`. Nếu chưa có, thêm vào `@/types`:

```ts
// @/types (thêm nếu chưa có)
export type PantryLocation = "FRIDGE" | "FREEZER" | "PANTRY_SHELF";
export type Unit = "MG" | "G" | "KG" | "ML" | "L" | "PCS" | "TBSP" | "TSP" | "CUP" | "PINCH";

export interface PantryItemResponse {
  id: string;
  ingredientId: string;
  ingredientName: string;
  categoryId: string;
  categoryName: string;
  quantity: number;
  unit: Unit;
  location?: PantryLocation;
  expiryDate?: string; // YYYY-MM-DD
  photoUri?: string;
}

export interface PantryItemCreateRequest {
  ingredientId: string;
  quantity: number;
  unit: Unit;
  location?: PantryLocation;
  expiryDate?: string;
}

export interface PantryItemUpdateRequest {
  quantity: number;
  unit: Unit;
  location?: PantryLocation;
  expiryDate?: string;
}

export interface CursorResponse<T> {
  content: T[];
  hasNext: boolean;
  nextCursor?: string;
}
```

### Bước 2. `features/pantry/types.ts` — interface

```ts
import type {
  CursorResponse,
  PantryItemCreateRequest,
  PantryItemResponse,
  PantryItemUpdateRequest,
  PantryLocation,
} from "@/types";

export interface PantryQuery {
  cursor?: string;
  size?: number;
  keyword?: string;
  categoryId?: string;
  location?: PantryLocation;
}

export interface IPantryApi {
  list(query: PantryQuery): Promise<CursorResponse<PantryItemResponse>>;
  create(body: PantryItemCreateRequest): Promise<PantryItemResponse>;
  update(id: string, body: PantryItemUpdateRequest): Promise<PantryItemResponse>;
  consume(id: string, quantity: number): Promise<PantryItemResponse>;
  remove(id: string): Promise<void>;
  expiring(days?: number): Promise<PantryItemResponse[]>;
}
```

### Bước 3. `features/pantry/httpPantryRepository.ts`

```ts
import type { AxiosInstance } from "axios";

import type {
  CursorResponse,
  PantryItemCreateRequest,
  PantryItemResponse,
  PantryItemUpdateRequest,
} from "@/types";
import type { IPantryApi, PantryQuery } from "./types";

export class HttpPantryRepository implements IPantryApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  list = async (query: PantryQuery): Promise<CursorResponse<PantryItemResponse>> => {
    const { data } = await this.privateHttp.get<CursorResponse<PantryItemResponse>>(
      "/v1/pantry-items",
      { params: query },
    );
    return data;
  };

  create = async (body: PantryItemCreateRequest): Promise<PantryItemResponse> => {
    const { data } = await this.privateHttp.post<PantryItemResponse>("/v1/pantry-items", body);
    return data;
  };

  update = async (id: string, body: PantryItemUpdateRequest): Promise<PantryItemResponse> => {
    const { data } = await this.privateHttp.put<PantryItemResponse>(`/v1/pantry-items/${id}`, body);
    return data;
  };

  consume = async (id: string, quantity: number): Promise<PantryItemResponse> => {
    const { data } = await this.privateHttp.post<PantryItemResponse>(
      `/v1/pantry-items/${id}/consume`,
      { quantity },
    );
    return data;
  };

  remove = async (id: string): Promise<void> => {
    await this.privateHttp.delete(`/v1/pantry-items/${id}`);
  };

  expiring = async (days = 3): Promise<PantryItemResponse[]> => {
    const { data } = await this.privateHttp.get<PantryItemResponse[]>("/v1/pantry-items/expiring", {
      params: { days },
    });
    return data;
  };
}
```

> **Lưu ý về `data`:** API thật trả `{ code, message, data }`. Trong `auth`, `login`/`register`/`getMe` trả thẳng `response.data` (tức là HTTP client đã bóc lớp ngoài), nhưng `updateMe` lại đọc `data.data`. **Hai cách này không thể cùng đúng.** Trước khi viết repository mới, mở HTTP client (interceptor) để xác định lớp ngoài có được bóc sẵn hay không, rồi **dùng đúng một cách cho mọi repository**. Ví dụ trên giả định đã bóc sẵn, giống `login`.

### Bước 4. `features/pantry/pantryService.ts`

```ts
import type {
  CursorResponse,
  PantryItemCreateRequest,
  PantryItemResponse,
  PantryItemUpdateRequest,
} from "@/types";
import type { IPantryApi, PantryQuery } from "./types";

export class PantryService {
  constructor(private readonly pantry: IPantryApi) {}

  list = (query: PantryQuery): Promise<CursorResponse<PantryItemResponse>> =>
    this.pantry.list(query);

  create = (body: PantryItemCreateRequest): Promise<PantryItemResponse> =>
    this.pantry.create(body);

  update = (id: string, body: PantryItemUpdateRequest): Promise<PantryItemResponse> =>
    this.pantry.update(id, body);

  /** Dùng hết số lượng thì xoá luôn món, nếu không thì trừ bớt. */
  async consume(item: PantryItemResponse, quantity: number): Promise<PantryItemResponse | null> {
    if (quantity >= item.quantity) {
      await this.pantry.remove(item.id);
      return null;
    }
    return this.pantry.consume(item.id, quantity);
  }

  remove = (id: string): Promise<void> => this.pantry.remove(id);

  expiring = (days?: number): Promise<PantryItemResponse[]> => this.pantry.expiring(days);
}
```

Đây là ví dụ về chỗ service đáng có: quy tắc "dùng hết thì xoá" là **nghiệp vụ**, không đặt ở màn hình hay hook.

### Bước 5. Đăng ký trong DI container

Mở `@/core/di/container` và khai báo **theo cách các service khác đang khai báo** (tên biến `privateHttp` có thể khác trong file thật):

```ts
import { HttpPantryRepository } from "@/features/pantry/httpPantryRepository";
import { PantryService } from "@/features/pantry/pantryService";

export const pantryService = new PantryService(new HttpPantryRepository(privateHttp));
```

### Bước 6. `features/pantry/pantrySlice.ts`

State gồm dữ liệu, trạng thái tải và con trỏ phân trang. **Trạng thái "đang tải" nằm ở đây**, không để `useState(loading)` trong màn hình.

```ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { pantryService } from "@/core/di/container";
import type { AppThunk } from "@/store/hooks";
import type {
  PantryItemCreateRequest,
  PantryItemResponse,
  PantryItemUpdateRequest,
} from "@/types";
import type { PantryQuery } from "./types";

export type PantryStatus = "idle" | "loading" | "loadingMore" | "saving";

interface PantryState {
  items: PantryItemResponse[];
  status: PantryStatus;
  hasNext: boolean;
  nextCursor?: string;
}

const initialState: PantryState = { items: [], status: "idle", hasNext: false };

const pantrySlice = createSlice({
  name: "pantry",
  initialState,
  reducers: {
    statusChanged(state, action: PayloadAction<PantryStatus>) {
      state.status = action.payload;
    },
    pageLoaded(
      state,
      action: PayloadAction<{ items: PantryItemResponse[]; hasNext: boolean; nextCursor?: string; replace: boolean }>,
    ) {
      const { items, hasNext, nextCursor, replace } = action.payload;
      state.items = replace ? items : [...state.items, ...items];
      state.hasNext = hasNext;
      state.nextCursor = nextCursor;
    },
    itemUpserted(state, action: PayloadAction<PantryItemResponse>) {
      const index = state.items.findIndex((i) => i.id === action.payload.id);
      if (index >= 0) state.items[index] = action.payload;
      else state.items.unshift(action.payload);
    },
    itemRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    cleared: () => initialState,
  },
});

export const { statusChanged, pageLoaded, itemUpserted, itemRemoved, cleared } = pantrySlice.actions;
export default pantrySlice.reducer;

/*
 * Thunk thường (không dùng createAsyncThunk) để lỗi gốc được ném nguyên cho hook/màn hình.
 */

const withStatus = async (
  dispatch: (a: ReturnType<typeof statusChanged>) => unknown,
  status: PantryStatus,
  run: () => Promise<void>,
) => {
  dispatch(statusChanged(status));
  try {
    await run();
  } finally {
    dispatch(statusChanged("idle"));
  }
};

/** Tải trang đầu (replace = true) hoặc trang kế tiếp. */
export const fetchPantry =
  (query: Omit<PantryQuery, "cursor"> = {}, loadMore = false): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { hasNext, nextCursor } = getState().pantry;
    if (loadMore && !hasNext) return;

    await withStatus(dispatch, loadMore ? "loadingMore" : "loading", async () => {
      const page = await pantryService.list({
        ...query,
        cursor: loadMore ? nextCursor : undefined,
      });
      dispatch(
        pageLoaded({
          items: page.content,
          hasNext: page.hasNext,
          nextCursor: page.nextCursor,
          replace: !loadMore,
        }),
      );
    });
  };

export const addPantryItem =
  (body: PantryItemCreateRequest): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await withStatus(dispatch, "saving", async () => {
      dispatch(itemUpserted(await pantryService.create(body)));
    });
  };

export const updatePantryItem =
  (id: string, body: PantryItemUpdateRequest): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await withStatus(dispatch, "saving", async () => {
      dispatch(itemUpserted(await pantryService.update(id, body)));
    });
  };

export const consumePantryItem =
  (item: PantryItemResponse, quantity: number): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await withStatus(dispatch, "saving", async () => {
      const updated = await pantryService.consume(item, quantity);
      dispatch(updated ? itemUpserted(updated) : itemRemoved(item.id));
    });
  };

export const removePantryItem =
  (id: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await withStatus(dispatch, "saving", async () => {
      await pantryService.remove(id);
      dispatch(itemRemoved(id));
    });
  };
```

### Bước 7. Đăng ký reducer trong store

```ts
// store (nơi đang gom reducer)
import pantryReducer from "@/features/pantry/pantrySlice";

reducer: {
  auth: authReducer,
  pantry: pantryReducer,   // ← thêm
}
```

Khi người dùng đăng xuất, nhớ dispatch `cleared()` của slice này (hoặc cho slice lắng nghe `unauthenticated` bằng `extraReducers`) để không giữ dữ liệu của tài khoản cũ.

### Bước 8. `features/pantry/validation.ts`

```ts
export const pantryValidators = {
  quantity: (v: string) => {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? null : "Số lượng phải lớn hơn 0";
  },
  required: (label: string) => (v: string) => (v.trim() ? null : `Vui lòng chọn ${label}`),
  date: (v: string) => (!v || /^\d{4}-\d{2}-\d{2}$/.test(v) ? null : "Ngày phải có dạng YYYY-MM-DD"),
};
```

### Bước 9. `features/pantry/usePantry.ts` — hook đọc và thao tác danh sách

```ts
import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { PantryItemResponse } from "@/types";
import type { PantryQuery } from "./types";
import {
  addPantryItem,
  consumePantryItem,
  fetchPantry,
  removePantryItem,
  updatePantryItem,
} from "./pantrySlice";

export function usePantry() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.pantry.items);
  const status = useAppSelector((s) => s.pantry.status);
  const hasNext = useAppSelector((s) => s.pantry.hasNext);

  const load = useCallback(
    (query?: Omit<PantryQuery, "cursor">) => dispatch(fetchPantry(query)),
    [dispatch],
  );
  const loadMore = useCallback(
    (query?: Omit<PantryQuery, "cursor">) => dispatch(fetchPantry(query, true)),
    [dispatch],
  );
  const add = useCallback(
    (body: Parameters<typeof addPantryItem>[0]) => dispatch(addPantryItem(body)),
    [dispatch],
  );
  const update = useCallback(
    (id: string, body: Parameters<typeof updatePantryItem>[1]) => dispatch(updatePantryItem(id, body)),
    [dispatch],
  );
  const consume = useCallback(
    (item: PantryItemResponse, quantity: number) => dispatch(consumePantryItem(item, quantity)),
    [dispatch],
  );
  const remove = useCallback((id: string) => dispatch(removePantryItem(id)), [dispatch]);

  return useMemo(
    () => ({
      items,
      status,
      hasNext,
      isLoading: status === "loading",
      isLoadingMore: status === "loadingMore",
      isSaving: status === "saving",
      load,
      loadMore,
      add,
      update,
      consume,
      remove,
    }),
    [items, status, hasNext, load, loadMore, add, update, consume, remove],
  );
}
```

### Bước 10. `features/pantry/usePantryForm.ts` — hook chứa logic của form

Đây là chỗ đặt toàn bộ logic mà bình thường người ta hay viết nhầm trong màn hình: giữ giá trị ô nhập, kiểm tra hợp lệ, chuyển chuỗi → số, gọi API, bắt lỗi, quyết định thông báo.

```ts
import { useCallback, useState } from "react";
import type { PantryLocation, Unit } from "@/types";
import { pantryValidators } from "./validation";
import { usePantry } from "./usePantry";

interface FormValues {
  ingredientId: string;
  quantity: string;
  unit: Unit | "";
  location: PantryLocation | "";
  expiryDate: string;
}

const EMPTY: FormValues = { ingredientId: "", quantity: "", unit: "", location: "", expiryDate: "" };

export type SubmitResult = { ok: true } | { ok: false; message: string };

export function usePantryForm(initial: Partial<FormValues> = {}) {
  const { add, isSaving } = usePantry();
  const [values, setValues] = useState<FormValues>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  const setField = useCallback(<K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const validate = useCallback((v: FormValues) => {
    const next = {
      ingredientId: pantryValidators.required("nguyên liệu")(v.ingredientId) ?? undefined,
      quantity: pantryValidators.quantity(v.quantity) ?? undefined,
      unit: pantryValidators.required("đơn vị")(v.unit) ?? undefined,
      expiryDate: pantryValidators.date(v.expiryDate) ?? undefined,
    };
    setErrors(next);
    return Object.values(next).every((e) => !e);
  }, []);

  /** Màn hình chỉ cần hiển thị kết quả, không phải tự bắt lỗi hay chuyển kiểu. */
  const submit = useCallback(async (): Promise<SubmitResult> => {
    if (!validate(values)) return { ok: false, message: "Vui lòng kiểm tra lại thông tin." };

    try {
      await add({
        ingredientId: values.ingredientId,
        quantity: Number(values.quantity.replace(",", ".")),
        unit: values.unit as Unit,
        location: values.location || undefined,
        expiryDate: values.expiryDate || undefined,
      });
      setValues(EMPTY);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Không thể thêm nguyên liệu.",
      };
    }
  }, [add, validate, values]);

  return { values, errors, setField, submit, isSubmitting: isSaving };
}
```

### Bước 11. Màn hình — chỉ hiển thị

```tsx
// app/(tabs)/pantry/add.tsx
import { Alert, View } from "react-native";
import { useRouter } from "expo-router";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { usePantryForm } from "@/features/pantry/usePantryForm";

export default function AddPantryItemScreen() {
  const router = useRouter();
  const { values, errors, setField, submit, isSubmitting } = usePantryForm();

  const handleSubmit = async () => {
    const result = await submit();
    if (result.ok) router.back();
    else Alert.alert("Lỗi", result.message);
  };

  return (
    <Screen>
      <View className="gap-4">
        <TextField
          label="Số lượng"
          value={values.quantity}
          onChangeText={(t) => setField("quantity", t)}
          error={errors.quantity}
          keyboardType="decimal-pad"
        />
        <Button title="Thêm vào tủ đồ" loading={isSubmitting} onPress={handleSubmit} />
      </View>
    </Screen>
  );
}
```

Để ý: màn hình **không có** `useState` cho loading, **không có** `try/catch`, **không có** chuyển `string → number`, **không import** service hay slice. Chỉ còn việc gọi `submit()` và quyết định hiển thị `Alert` hoặc điều hướng.

Màn hình danh sách làm tương tự:

```tsx
export default function PantryScreen() {
  const { items, isLoading, hasNext, load, loadMore } = usePantry();

  useEffect(() => {
    void load();
  }, [load]);   // load đã được bọc useCallback nên không gây vòng lặp

  return (/* FlatList dùng items, onEndReached={() => hasNext && loadMore()} */);
}
```

---

## 6. Quy tắc "không để logic ở giao diện"

### 6.1 Cái gì được phép nằm trong màn hình

- JSX, `className`, bố cục.
- `useState` cho trạng thái **thuần giao diện**: đang mở/đóng modal, tab đang chọn.
- Điều hướng (`router.push`, `router.back`) và hiển thị thông báo (`Alert`) **dựa trên kết quả** mà hook trả về.
- Gọi hàm của hook trong `onPress` / `useEffect`.

### 6.2 Cái gì phải chuyển vào hook / slice / service

| Đang viết trong màn hình | Chuyển sang |
|---|---|
| `useState(loading)` rồi `setLoading(true/false)` quanh lời gọi API | `status` trong slice, hook trả `isLoading` / `isSaving` |
| `try/catch` quanh lời gọi API, chọn câu thông báo lỗi | hook trả `{ ok, message }` (xem `usePantryForm.submit`) |
| Kiểm tra dữ liệu nhập (`if (!name) …`) | `validation.ts`, gọi trong hook form |
| Chuyển kiểu (`Number(...)`, cắt khoảng trắng, đổi định dạng ngày) | hook form hoặc service |
| Xin quyền và chọn ảnh (`ImagePicker`), dựng `PickedImage` | hook riêng (ví dụ `useAvatarPicker.ts`) |
| Quy tắc nghiệp vụ ("dùng hết thì xoá", "đổi mật khẩu xong thì đăng xuất") | service |
| Gọi `fetch`/`axios` | repository |
| Đồng bộ state từ props sang input (`useEffect` + `setDisplayName`) | hook form (nhận giá trị khởi tạo) |

### 6.3 Ví dụ: `ProfileScreen` hiện tại nên tách thế nào

Màn hình hồ sơ hiện đang tự làm các việc sau, đều nên chuyển vào hook:

1. Giữ `displayName`, kiểm tra rỗng, `trim()` → **`useProfileForm.ts`** (`values`, `setField`, `submit`).
2. Xin quyền thư viện ảnh, mở picker, dựng `PickedImage` → **`useAvatarPicker.ts`** (`pickAndUpload(): Promise<SubmitResult>`).
3. `loading` / `avatarLoading` → lấy từ slice (`status`) thay vì `useState`.
4. Xác nhận xoá tài khoản khác nhau giữa web và mobile (`window.confirm` / `Alert`) → hook `useDeleteAccount.ts` trả về hàm `confirmAndDelete()`, màn hình chỉ gọi.

Sau khi tách, `ProfileScreen` chỉ còn render và gắn các hàm vào nút bấm.

### 6.4 Quy tắc về lỗi

- Repository và thunk **không bắt lỗi**, để lỗi gốc nổi lên.
- Hook (hoặc `submit` trong hook form) là nơi **bắt lỗi một lần** và đổi thành thông điệp cho người dùng.
- Màn hình chỉ **hiển thị** thông điệp đó.

---

## 7. Checklist khi tạo feature mới

Tạo thư mục `features/<tên>/` rồi đi theo thứ tự:

- [ ] DTO đã có trong `@/types` (khớp `API_DOCUMENTATION.md`).
- [ ] `types.ts`: interface `I<Tên>Api` (đặt tên theo vai trò).
- [ ] `http<Tên>Repository.ts`: `implements` interface, nhận `AxiosInstance`, dùng đúng `publicHttp`/`privateHttp`, trả về DTO, **cùng cách xử lý `data` với các repository khác**.
- [ ] `<tên>Service.ts`: nhận interface qua constructor, chứa quy tắc nghiệp vụ.
- [ ] Đăng ký trong `@/core/di/container`.
- [ ] `<tên>Slice.ts`: state (có `status`), reducer, thunk **dạng hàm thường**, `export default reducer`.
- [ ] Đăng ký reducer vào store; xử lý reset khi đăng xuất.
- [ ] `validation.ts` nếu có form.
- [ ] `use<Tên>.ts` (đọc + hành động) và `use<Tên>Form.ts` nếu có form.
- [ ] Màn hình trong `app/` chỉ import hook và component UI.
- [ ] Kiểm tra: màn hình không import `axios`, `Service`, `Slice`, `Repository`.
- [ ] Kiểm tra: mọi lời gọi API đều có chỗ bắt lỗi (trong hook) và có trạng thái tải (trong slice).

---

## 8. Những lỗi hay gặp

1. **Ghi đè state bằng response thiếu dữ liệu.** Nếu thunk `dispatch(authenticated(await api.updateMe(...)))` mà response không đầy đủ (hoặc chưa được bóc đúng lớp `data`), `user` sẽ mất `email`/`avatarUri`. Cách an toàn: sau khi cập nhật, lấy lại bản đầy đủ bằng `getMe()` (như `updateAvatar` đang làm), hoặc gộp `{ ...cũ, ...mới }` trong reducer.
2. **Mỗi repository bóc `data` một kiểu.** Chọn một cách duy nhất (xem lưu ý ở Bước 3).
3. **`useEffect` chạy lặp vô hạn** vì hàm trong hook không ổn định. Luôn bọc hàm trả về từ hook bằng `useCallback` (hoặc `useMemo` cho cả object) như `useAuth` và `useUser`.
4. **Dùng `createAsyncThunk` rồi mất lỗi gốc.** Dự án dùng thunk thường để lỗi `ApiError`/`AxiosError` đi nguyên vẹn tới hook. Giữ nguyên quy ước này.
5. **Khai báo `new Service(...)` rải rác** trong slice hoặc hook. Chỉ khai báo trong `@/core/di/container`.
6. **Quên reset state khi đăng xuất**, khiến tài khoản mới đăng nhập thấy dữ liệu của tài khoản trước.
7. **Chuyển hướng/Alert nằm trong thunk hoặc service.** Đây là việc của màn hình, dựa trên kết quả hook trả về.
8. **Upload ảnh trên web.** Web cần `Blob` thật, mobile dùng `{ uri, name, type }` (xem `HttpUserRepository.updateAvatar`). Tên field là `avatar` (hồ sơ), `image` (ảnh công thức / tủ đồ / AI).
9. **Đặt tên file không đúng quy ước** (`PantryService.ts`, `pantryHelpers.ts`, `usePantryStuff.ts`). Xem lại [mục 3](#3-quy-tắc-đặt-tên).
