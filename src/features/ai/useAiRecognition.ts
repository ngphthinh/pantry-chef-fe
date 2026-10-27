import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { recognitionCleared, recognizeIngredients } from "./aiSlice";

export function useAiRecognition() {
  const dispatch = useAppDispatch();
  const ingredients = useAppSelector((s) => s.ai.recognized);

  return useMemo(
    () => ({
      ingredients,
      recognize: (image: Parameters<typeof recognizeIngredients>[0]) =>
        dispatch(recognizeIngredients(image)),
      clear: () => dispatch(recognitionCleared()),
    }),
    [ingredients, dispatch],
  );
}
