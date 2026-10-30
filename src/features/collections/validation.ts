export const collectionValidators = {
    name: (v: string) => {
        const name = v.trim();
        if (!name) return "Vui lòng nhập tên bộ sưu tập";
        if (name.length > 100) return "Tên tối đa 100 ký tự";
        return null;
    },
};