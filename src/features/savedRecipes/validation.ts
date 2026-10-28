export const savedRecipeValidators = {
    rating: (v: number) =>
        v === 0 || (Number.isInteger(v) && v >= 1 && v <= 5) ? null : "Đánh giá phải từ 1 đến 5 sao",
    note: (v: string) => (v.length <= 2000 ? null : "Ghi chú tối đa 2000 ký tự"),
};