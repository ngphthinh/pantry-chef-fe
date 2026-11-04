/** Chuyển về chữ thường, bỏ dấu tiếng Việt để so sánh không phân biệt dấu. */
export const normalizeText = (s: string): string =>
    s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .trim();