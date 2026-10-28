import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { usePantry } from '@/features/pantry/usePantry';
import { criteriaChanged } from './recipeSlice';
import { MAX_SEARCH_INGREDIENTS } from './recipeService';

/**
 * Logic của trang tab "Tìm món": chip nguyên liệu lấy từ tủ (chỉ đọc tên, không gọi API pantry trực tiếp),
 * chọn/bỏ chọn nguyên liệu và chuẩn bị tiêu chí cho màn kết quả.
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
    if (items.length === 0) void loadItems().catch(() => undefined);
    // chỉ chạy khi vào trang
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Khi người dùng chưa tự chọn thì mặc định chọn các nguyên liệu đầu tiên trong tủ
  useEffect(() => {
    if (!touched) setSelected(pantryNames.slice(0, MAX_SEARCH_INGREDIENTS));
  }, [pantryNames, touched]);

  const toggle = useCallback((name: string) => {
    setTouched(true);
    setSelected((current) => {
      if (current.includes(name)) return current.filter((n) => n !== name);
      return current.length >= MAX_SEARCH_INGREDIENTS ? current : [...current, name];
    });
  }, []);

  /** Ghi tiêu chí vào store; trả false nếu chưa chọn nguyên liệu nào. */
  const prepareSearch = useCallback((): boolean => {
    if (selected.length === 0) return false;
    dispatch(
      criteriaChanged({
        ingredients: selected,
        cuisineId: undefined,
        maxMinutes: undefined,
        difficulty: undefined,
      }),
    );
    return true;
  }, [dispatch, selected]);

  return {
    keyword,
    setKeyword,
    keywordValue: keyword.trim(),
    pantryNames,
    selected,
    selectedCount: selected.length,
    maxIngredients: MAX_SEARCH_INGREDIENTS,
    isPantryLoading: isLoading,
    toggle,
    prepareSearch,
  };
}
