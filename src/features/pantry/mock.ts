export type Freshness = 'fresh' | 'soon' | 'expired';
export interface PantryItem { id: string; name: string; qty: string; place: string; group: 'Rau củ' | 'Thịt'; freshness: Freshness; label: string }

export const PANTRY_ITEMS: PantryItem[] = [
  { id: '1', name: 'Cà chua', qty: '500 g', place: 'Tủ lạnh', group: 'Rau củ', freshness: 'soon', label: 'Còn 2 ngày' },
  { id: '2', name: 'Hành lá', qty: '100 g', place: 'Tủ lạnh', group: 'Rau củ', freshness: 'fresh', label: 'Còn tươi' },
  { id: '3', name: 'Thịt ba chỉ', qty: '400 g', place: 'Tủ đông', group: 'Thịt', freshness: 'expired', label: 'Hết hạn' },
  { id: '4', name: 'Trứng gà', qty: '6 quả', place: 'Tủ lạnh', group: 'Thịt', freshness: 'fresh', label: 'Còn tươi' },
];
