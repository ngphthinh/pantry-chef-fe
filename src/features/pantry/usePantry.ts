import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type {
  PantryItemBatchCreateRequest,
  PantryItemCreateRequest,
  PantryItemResponse,
  PantryItemUpdateRequest,
  PickedImage,
  StorageLocation,
} from '@/types';
import {
  consumePantryItem,
  createPantryBatch,
  createPantryItem,
  deletePantryItem,
  fetchExpiringItems,
  fetchPantryItemById,
  fetchPantryItems,
  updatePantryItem,
  uploadPantryPhoto,
} from './pantrySlice';
import type { FreshnessInfo, FreshnessStatus, PantryQuery } from './types';

export function calculateFreshness(expiryDate?: string | null): FreshnessInfo {
  if (!expiryDate) {
    return {
      status: 'fresh',
      label: 'Còn tươi',
      daysRemaining: null,
    };
  }

  // Phân tích YYYY-MM-DD
  const [year, month, day] = expiryDate.split('-').map(Number);
  if (!year || !month || !day) {
    return {
      status: 'fresh',
      label: 'Còn tươi',
      daysRemaining: null,
    };
  }

  const expiry = new Date(year, month - 1, day);
  expiry.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'expired',
      label: 'Hết hạn',
      daysRemaining: diffDays,
    };
  }

  if (diffDays === 0) {
    return {
      status: 'soon',
      label: 'Hết hạn hôm nay',
      daysRemaining: 0,
    };
  }

  if (diffDays <= 2) {
    return {
      status: 'soon',
      label: `Còn ${diffDays} ngày`,
      daysRemaining: diffDays,
    };
  }

  if (diffDays <= 5) {
    return {
      status: 'fresh',
      label: `Còn ${diffDays} ngày`,
      daysRemaining: diffDays,
    };
  }

  return {
    status: 'fresh',
    label: 'Còn tươi',
    daysRemaining: diffDays,
  };
}

export interface EnrichedPantryItem extends PantryItemResponse {
  freshness: FreshnessInfo;
}

export function usePantry() {
  const dispatch = useAppDispatch();
  const rawItems = useAppSelector((s) => s.pantry.items);
  const rawExpiringItems = useAppSelector((s) => s.pantry.expiringItems);
  const rawSelectedItem = useAppSelector((s) => s.pantry.selectedItem);
  const status = useAppSelector((s) => s.pantry.status);
  const hasNext = useAppSelector((s) => s.pantry.hasNext);
  const nextCursor = useAppSelector((s) => s.pantry.nextCursor);

  // Tính nhãn độ tươi ngay trong hook
  const items: EnrichedPantryItem[] = useMemo(
    () =>
      rawItems.map((item) => ({
        ...item,
        freshness: calculateFreshness(item.expiryDate),
      })),
    [rawItems],
  );

  const expiringItems: EnrichedPantryItem[] = useMemo(
    () =>
      rawExpiringItems.map((item) => ({
        ...item,
        freshness: calculateFreshness(item.expiryDate),
      })),
    [rawExpiringItems],
  );

  const selectedItem: EnrichedPantryItem | null = useMemo(
    () =>
      rawSelectedItem
        ? {
            ...rawSelectedItem,
            freshness: calculateFreshness(rawSelectedItem.expiryDate),
          }
        : null,
    [rawSelectedItem],
  );

  const loadItems = useCallback(
    (query: PantryQuery = {}, append = false) => dispatch(fetchPantryItems(query, append)),
    [dispatch],
  );

  const loadMore = useCallback(
    (query: Omit<PantryQuery, 'cursor'> = {}) => {
      if (!hasNext || !nextCursor) return Promise.resolve(null);
      return dispatch(fetchPantryItems({ ...query, cursor: nextCursor }, true));
    },
    [dispatch, hasNext, nextCursor],
  );

  const loadExpiring = useCallback(
    (days = 3) => dispatch(fetchExpiringItems(days)),
    [dispatch],
  );

  const loadItemById = useCallback(
    (id: string) => dispatch(fetchPantryItemById(id)),
    [dispatch],
  );

  const create = useCallback(
    (body: PantryItemCreateRequest) => dispatch(createPantryItem(body)),
    [dispatch],
  );

  const createBatch = useCallback(
    (body: PantryItemBatchCreateRequest) => dispatch(createPantryBatch(body)),
    [dispatch],
  );

  const update = useCallback(
    (id: string, body: PantryItemUpdateRequest) => dispatch(updatePantryItem(id, body)),
    [dispatch],
  );

  const consume = useCallback(
    (id: string, quantity: number) => dispatch(consumePantryItem(id, quantity)),
    [dispatch],
  );

  const remove = useCallback(
    (id: string) => dispatch(deletePantryItem(id)),
    [dispatch],
  );

  const uploadPhoto = useCallback(
    (id: string, image: PickedImage) => dispatch(uploadPantryPhoto(id, image)),
    [dispatch],
  );

  // Nhóm theo category hoặc theo vị trí bảo quản
  const groupByCategory = useMemo(() => {
    const map = new Map<string, EnrichedPantryItem[]>();
    items.forEach((item) => {
      const key = item.categoryName || 'Khác';
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    });
    return Array.from(map.entries()).map(([categoryName, groupItems]) => ({
      categoryName,
      items: groupItems,
    }));
  }, [items]);

  const groupByLocation = useMemo(() => {
    const map = new Map<StorageLocation | 'UNASSIGNED', EnrichedPantryItem[]>();
    items.forEach((item) => {
      const loc = item.location ?? 'UNASSIGNED';
      const list = map.get(loc) ?? [];
      list.push(item);
      map.set(loc, list);
    });
    return Array.from(map.entries()).map(([location, groupItems]) => ({
      location,
      items: groupItems,
    }));
  }, [items]);

  return {
    items,
    expiringItems,
    selectedItem,
    status,
    isLoading: status === 'loading',
    isSaving: status === 'saving',
    isConsuming: status === 'consuming',
    isUploading: status === 'uploading',
    hasNext,
    nextCursor,
    groupByCategory,
    groupByLocation,
    loadItems,
    loadMore,
    loadExpiring,
    loadItemById,
    create,
    createBatch,
    update,
    consume,
    remove,
    uploadPhoto,
  };
}
