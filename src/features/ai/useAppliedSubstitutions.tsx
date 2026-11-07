import React, { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { AppText } from "@/components/ui/AppText";
import {
  substitutionApplied,
  substitutionRemoved,
  type AppliedSubstitution,
} from "./aiSlice";

function getIngredientCandidates(name: string): string[] {
  const trimmed = name.trim().toLowerCase();
  const candidates: string[] = [trimmed];

  if (trimmed.startsWith("thịt ")) {
    const sub = trimmed.slice(5).trim();
    if (sub.length >= 2) candidates.push(sub);
  } else if (trimmed.startsWith("cá ")) {
    const sub = trimmed.slice(3).trim();
    if (sub.length >= 2) candidates.push(sub);
  } else if (trimmed.startsWith("tôm ")) {
    const sub = trimmed.slice(4).trim();
    if (sub.length >= 2) candidates.push(sub);
  } else if (trimmed.startsWith("trứng ")) {
    candidates.push("trứng");
  } else if (trimmed.startsWith("sữa ")) {
    candidates.push("sữa");
  }

  return candidates.sort((a, b) => b.length - a.length);
}

export function useAppliedSubstitutions(
  recipeId?: string,
  recipeTitle?: string,
) {
  const dispatch = useAppDispatch();
  const applied = useAppSelector((s) => s.ai.appliedSubstitutions);

  // Danh sách các nguyên liệu đã thay thế thuộc công thức này
  const recipeSubstitutions = useMemo(() => {
    const result: { original: string; replacement: string; ratio?: string }[] =
      [];
    const idPrefix = recipeId ? `${recipeId}::` : null;
    const titlePrefix = recipeTitle ? `${recipeTitle}::` : null;
    const seen = new Set<string>();

    for (const [key, sub] of Object.entries(applied)) {
      let orig = "";
      if (idPrefix && key.startsWith(idPrefix)) {
        orig = key.slice(idPrefix.length);
      } else if (titlePrefix && key.startsWith(titlePrefix)) {
        orig = key.slice(titlePrefix.length);
      }
      if (orig && !seen.has(orig)) {
        seen.add(orig);
        result.push({
          original: orig,
          replacement: sub.name,
          ratio: sub.ratio,
        });
      }
    }
    return result;
  }, [applied, recipeId, recipeTitle]);

  const getSubstitution = useCallback(
    (originalIngredient: string): AppliedSubstitution | undefined => {
      if (!originalIngredient) return undefined;
      const lower = originalIngredient.trim().toLowerCase();
      if (recipeId) {
        const byId = applied[`${recipeId}::${lower}`];
        if (byId) return byId;
      }
      if (recipeTitle) {
        const byTitle = applied[`${recipeTitle}::${lower}`];
        if (byTitle) return byTitle;
      }
      return undefined;
    },
    [applied, recipeId, recipeTitle],
  );

  const apply = useCallback(
    (originalIngredient: string, substitution: AppliedSubstitution) => {
      if (!originalIngredient) return;
      if (recipeId) {
        dispatch(
          substitutionApplied({
            recipeKey: recipeId,
            originalIngredient,
            substitution,
          }),
        );
      }
      if (recipeTitle) {
        dispatch(
          substitutionApplied({
            recipeKey: recipeTitle,
            originalIngredient,
            substitution,
          }),
        );
      }
    },
    [dispatch, recipeId, recipeTitle],
  );

  const remove = useCallback(
    (originalIngredient: string) => {
      if (!originalIngredient) return;
      if (recipeId) {
        dispatch(
          substitutionRemoved({
            recipeKey: recipeId,
            originalIngredient,
          }),
        );
      }
      if (recipeTitle) {
        dispatch(
          substitutionRemoved({
            recipeKey: recipeTitle,
            originalIngredient,
          }),
        );
      }
    },
    [dispatch, recipeId, recipeTitle],
  );

  /**
   * Tự động thay thế tên nguyên liệu cũ trong văn bản các bước thực hiện bằng
   * tên nguyên liệu thay thế mới (và làm nổi bật bằng chữ đậm màu thương hiệu).
   */
  const adaptStepText = useCallback(
    (text: string): React.ReactNode => {
      if (!text || recipeSubstitutions.length === 0) {
        return text;
      }

      interface MatchItem {
        start: number;
        end: number;
        replacement: string;
      }

      const matches: MatchItem[] = [];

      for (const item of recipeSubstitutions) {
        const candidates = getIngredientCandidates(item.original);
        for (const cand of candidates) {
          const escaped = cand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(
            `(^|[^a-zA-Z0-9À-ỹ])(${escaped})(?=[^a-zA-Z0-9À-ỹ]|$)`,
            "gi",
          );
          let m: RegExpExecArray | null;
          while ((m = regex.exec(text)) !== null) {
            const prefixLen = m[1].length;
            const start = m.index + prefixLen;
            const matchedWord = m[2];
            const end = start + matchedWord.length;

            const isUpper =
              matchedWord[0] === matchedWord[0].toUpperCase() &&
              matchedWord[0] !== matchedWord[0].toLowerCase();
            let rep = item.replacement;
            if (isUpper) {
              rep = rep.charAt(0).toUpperCase() + rep.slice(1);
            } else {
              rep = rep.charAt(0).toLowerCase() + rep.slice(1);
            }

            matches.push({ start, end, replacement: rep });
          }
        }
      }

      if (matches.length === 0) {
        return text;
      }

      // Sắp xếp theo vị trí xuất hiện
      matches.sort(
        (a, b) => a.start - b.start || b.end - b.start - (a.end - a.start),
      );

      // Loại bỏ các khoảng đè nhau
      const nonOverlapping: MatchItem[] = [];
      let lastEnd = 0;
      for (const m of matches) {
        if (m.start >= lastEnd) {
          nonOverlapping.push(m);
          lastEnd = m.end;
        }
      }

      const elements: React.ReactNode[] = [];
      let cursor = 0;
      nonOverlapping.forEach((m, idx) => {
        if (m.start > cursor) {
          elements.push(text.slice(cursor, m.start));
        }
        elements.push(
          <AppText
            key={`sub-${idx}`}
            className="font-bold text-brand dark:text-brand"
            accessibilityLabel={`Thay thế: ${m.replacement}`}>
            {m.replacement}
          </AppText>,
        );
        cursor = m.end;
      });

      if (cursor < text.length) {
        elements.push(text.slice(cursor));
      }

      return elements;
    },
    [recipeSubstitutions],
  );

  return {
    recipeSubstitutions,
    getSubstitution,
    apply,
    remove,
    adaptStepText,
  };
}
