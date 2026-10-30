import { useCallback, useState } from "react";

import type { ActionResult } from "@/core/result/runAction";
import { collectionValidators } from "./validation";
import { useCollections } from "./useCollections";

export function useCollectionForm(collection?: { id: string; name: string }) {
    const { create, rename, isSaving } = useCollections();
    const [name, setNameValue] = useState(collection?.name ?? "");
    const [error, setError] = useState<string | undefined>();

    const setName = useCallback((value: string) => {
        setNameValue(value);
        setError(undefined);
    }, []);

    const submit = useCallback(async (): Promise<ActionResult> => {
        const invalid = collectionValidators.name(name);
        if (invalid) {
            setError(invalid);
            return { ok: false, message: invalid };
        }

        const trimmed = name.trim();
        const result = collection ? await rename(collection.id, trimmed) : await create(trimmed);
        if (!result.ok) return result;

        if (!collection) setNameValue(""); // tạo xong thì xoá ô nhập để mở hộp thoại lần sau
        return { ok: true, data: undefined };
    }, [collection, create, name, rename]);

    return { name, error, setName, submit, isSubmitting: isSaving };
}