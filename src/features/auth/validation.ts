const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validators = {
  email: (v: string) => (EMAIL.test(v.trim()) ? null : 'Email không hợp lệ'),
  password: (v: string) => (v.length >= 6 ? null : 'Mật khẩu tối thiểu 6 ký tự'),
  required: (label: string) => (v: string) => (v.trim() ? null : `Vui lòng nhập ${label}`),
  match: (field: string) => (v: string, all: Record<string, string>) =>
    v === all[field] ? null : 'Mật khẩu nhập lại không khớp',
};
