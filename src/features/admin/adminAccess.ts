/**
 * Token có quyền admin hay không, dựa trên `scope` của /v1/auth/introspect.
 * Chấp nhận "ROLE_ADMIN" hoặc "ADMIN", scope có thể cách nhau bằng khoảng trắng hoặc dấu phẩy.
 * Nếu backend dùng tên khác, chỉ cần sửa ở đây.
 */
export const isAdminScope = (scope?: string | null): boolean =>
  (scope ?? "").split(/[\s,]+/).some((part) => /^(ROLE_)?ADMIN$/i.test(part));
