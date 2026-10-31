import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { usePantry } from '@/features/pantry/usePantry';
import { criteriaChanged } from './recipeSlice';

/**
 * Logic của trang tab "Tìm món": chip nguyên liệu lấy từ tủ (chỉ đọc tên, không gọi API pantry trực tiếp),
 * chọn/bỏ chọn nguyên liệu (không giới hạn số lượng) và chuẩn bị tiêu chí cho màn kết quả.
 */
export function useRecipeSearchHub() {
  const dispatch = useAppDispatch();
  const { items, loadItems, isLoading } = usePantry();

  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);

  const pantryNames = useMemo(() => {
    const seen = new Set<string>();
    return items
      .map((item) => item.ingredientName)
      .filter((name) => {
        const key = name.trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [items]);

  // Tủ chưa có dữ liệu thì tải một lần; lỗi chỉ làm mất chip, trang vẫn dùng được
  useEffect(() => {
  (async () => {
    try {
      let page = await loadItems({ size: 50 });
      while (page.hasNext && page.nextCursor) {
        page = await loadItems({ size: 50, cursor: page.nextCursor }, true);
      }
    } catch {
      // lỗi chỉ làm thiếu chip, trang vẫn dùng được
    }
  })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  // Khi người dùng chưa tự chọn thì mặc định chọn toàn bộ nguyên liệu trong tủ
  useEffect(() => {
    if (!touched) setSelected(pantryNames);
  }, [pantryNames, touched]);

  const toggle = useCallback((name: string) => {
    setTouched(true);
    setSelected((current) =>
      current.includes(name) ? current.filter((n) => n !== name) : [...current, name],
    );
  }, []);

  /** Ghi tiêu chí "theo nguyên liệu" vào store; trả false nếu chưa chọn nguyên liệu nào. */
  const prepareSearch = useCallback((): boolean => {
    if (selected.length === 0) return false;
    dispatch(
      criteriaChanged({
        mode: 'ingredients',
        keyword: '',
        ingredients: selected,
        cuisineId: undefined,
        maxMinutes: undefined,
        difficulty: undefined,
      }),
    );
    return true;
  }, [dispatch, selected]);

  /** Ghi tiêu chí "theo tên món" vào store; trả false nếu chưa nhập gì. */
  const prepareNameSearch = useCallback((): boolean => {
    const text = keyword.trim();
    if (!text) return false;
    dispatch(
      criteriaChanged({
        mode: 'name',
        keyword: text,
        cuisineId: undefined,
        maxMinutes: undefined,
        difficulty: undefined,
      }),
    );
    return true;
  }, [dispatch, keyword]);

  return {
    keyword,
    setKeyword,
    pantryNames,
    selected,
    selectedCount: selected.length,
    isPantryLoading: isLoading,
    toggle,
    prepareSearch,
    prepareNameSearch,
  };
}
