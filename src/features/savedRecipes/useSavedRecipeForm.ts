import { useCallback, useEffect, useMemo, useState } from "react";

import type { SavedRecipeUpdateRequest } from "@/types";
import { savedRecipeValidators } from "./validation";
import { useSavedRecipes} from "./useSavedRecipes";
import type {ActionResult} from "@/core/result/runAction";

interface FormValues {
    rating: number;
    note: string;
    favorite: boolean;
}

const EMPTY: FormValues = { rating: 0, note: "", favorite: false };

export function useSavedRecipeForm(id: string) {
    const { detail, isLoadingDetail, isSaving, loadDetail, update, remove } = useSavedRecipes();
    const [values, setValues] = useState<FormValues>(EMPTY);
    const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
    const [loadError, setLoadError] = useState<string | null>(null);

    const current = detail?.id === id ? detail : null;
    const removeSaved = useCallback(() => remove(id), [id, remove]);

    useEffect(() => {
        let active = true;
        setLoadError(null);
        void loadDetail(id).then((result) => {
            if (active && !result.ok) setLoadError(result.message);
        });
        return () => {
            active = false;
        };
    }, [id, loadDetail]);

    // Chỉ đồng bộ khi mở món khác hoặc khi tải xong, KHÔNG đồng bộ sau khi lưu
    // để không ghi đè nội dung người dùng đang gõ.
    useEffect(() => {
        if (!current) return;
        setValues({
            rating: current.rating ?? 0,
            note: current.note ?? "",
            favorite: current.favorite,
        });
        setErrors({});
    }, [current?.id]);

    const setField = useCallback(<K extends keyof FormValues>(key: K, value: FormValues[K]) => {
        setValues((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    }, []);

    const submit = useCallback(async (): Promise<ActionResult> => {
        if (!current) return { ok: false, message: "Món đã lưu chưa tải xong." };

        const next = {
            rating: savedRecipeValidators.rating(values.rating) ?? undefined,
            note: savedRecipeValidators.note(values.note) ?? undefined,
        };
        setErrors(next);
        if (next.rating || next.note) return { ok: false, message: "Vui lòng kiểm tra lại thông tin." };

        // PATCH: chỉ gửi những gì đã đổi.
        const body: SavedRecipeUpdateRequest = {};
        if (values.rating > 0 && values.rating !== (current.rating ?? 0)) body.rating = values.rating;
        const note = values.note.trim();
        if (note !== (current.note ?? "")) body.note = note;
        if (values.favorite !== current.favorite) body.favorite = values.favorite;

        if (Object.keys(body).length === 0) return { ok: true, data: undefined };
        return update(id, body);
    }, [current, id, update, values]);

    const isDirty = useMemo(
        () =>
            !!current &&
            (values.rating !== (current.rating ?? 0) ||
                values.note.trim() !== (current.note ?? "") ||
                values.favorite !== current.favorite),
        [current, values],
    );

    return {
        recipe: current?.recipe ?? null,
        values,
        errors,
        setField,
        submit,
        isDirty,
        isLoading: isLoadingDetail && !current,
        isSubmitting: isSaving,
        loadError,
        remove: removeSaved
    };
}