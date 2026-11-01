import { useMemo } from "react";
import { privacyPolicy } from "@/assets/legal/privacy-policy";

export type PolicyBlock = {
  type: "title" | "heading" | "bullet" | "paragraph";
  text: string;
};

const parse = (raw: string): PolicyBlock[] =>
  raw
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line): PolicyBlock => {
      if (line.startsWith("## ")) {
        return { type: "heading", text: line.slice(3) };
      }

      if (line.startsWith("# ")) {
        return { type: "title", text: line.slice(2) };
      }

      if (line.startsWith("- ")) {
        return { type: "bullet", text: line.slice(2) };
      }

      return { type: "paragraph", text: line };
    });

export function usePrivacyPolicy() {
  const blocks = useMemo(() => parse(privacyPolicy), []);

  return {
    blocks,
    error: null,
    isLoading: false,
    retry: () => {},
  };
}
