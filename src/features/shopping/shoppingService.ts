import {
  ShoppingItemStatus,
  Unit,
  type CursorResponse,
  type ShoppingItemCreateRequest,
  type ShoppingItemResponse,
  type ShoppingListCreateRequest,
  type ShoppingListDetailResponse,
  type ShoppingListResponse,
} from "@/types";
import type { IShoppingItemApi, IShoppingListApi, ShoppingListQuery } from "./types";

/** Thay đổi muốn áp lên một mục; trường nào bỏ trống thì giữ nguyên giá trị hiện có. */
export interface ShoppingItemPatch {
  name?: string;
  quantity?: number;
  unit?: Unit;
  status?: ShoppingItemStatus;
}

/**
 * BE từ chối PATCH nếu thiếu/null bất kỳ trường nào trong name, quantity, unit, status.
 * Mục tạo ra không có số lượng/đơn vị thì BE trả null, nên khi sửa phải điền mặc định.
 */
const DEFAULT_QUANTITY = 1;
const DEFAULT_UNIT = Unit.PCS;

export class ShoppingService {
  constructor(
    private readonly lists: IShoppingListApi,
    private readonly items: IShoppingItemApi,
  ) {}

  // ───────── Danh sách ─────────

  getLists = (query: ShoppingListQuery): Promise<CursorResponse<ShoppingListResponse>> =>
    this.lists.getLists(query);

  createList = (body: ShoppingListCreateRequest): Promise<ShoppingListResponse> =>
    this.lists.createList({ ...body, name: body.name.trim() });

  getList = (id: string): Promise<ShoppingListDetailResponse> => this.lists.getList(id);

  renameList = (id: string, name: string): Promise<ShoppingListResponse> =>
    this.lists.renameList(id, { name: name.trim() });

  removeList = (id: string): Promise<void> => this.lists.removeList(id);

  // ───────── Mục ─────────

  addItem = (listId: string, body: ShoppingItemCreateRequest): Promise<ShoppingItemResponse> =>
    this.items.addItem(listId, { ...body, name: body.name.trim() });

  /** Gộp `patch` vào mục hiện có để luôn gửi đủ 4 trường như BE yêu cầu. */
  updateItem = (
    listId: string,
    item: ShoppingItemResponse,
    patch: ShoppingItemPatch,
  ): Promise<ShoppingItemResponse> =>
    this.items.updateItem(listId, item.id, {
      name: (patch.name ?? item.name).trim(),
      quantity: patch.quantity ?? item.quantity ?? DEFAULT_QUANTITY,
      unit: patch.unit ?? item.unit ?? DEFAULT_UNIT,
      status: patch.status ?? item.status,
    });

  /** Đánh dấu đã mua / bỏ đánh dấu. */
  toggleItem = (listId: string, item: ShoppingItemResponse): Promise<ShoppingItemResponse> =>
    this.updateItem(listId, item, {
      status:
        item.status === ShoppingItemStatus.BOUGHT ? ShoppingItemStatus.PENDING : ShoppingItemStatus.BOUGHT,
    });

  removeItem = (listId: string, itemId: string): Promise<void> => this.items.removeItem(listId, itemId);

  // ───────── Dùng chung với meal-plan ─────────

  /**
   * Tạo danh sách mới rồi thêm lần lượt từng nguyên liệu (dùng khi lưu thực đơn thành danh sách mua).
   * Thêm tuần tự để thứ tự mục giữ đúng như đầu vào.
   */
  saveItemsAsList = async (
    name: string,
    items: ShoppingItemCreateRequest[],
  ): Promise<ShoppingListResponse> => {
    const list = await this.createList({ name });
    for (const item of items) {
      await this.addItem(list.id, item);
    }
    return list;
  };
}
