import { useEffect, useMemo, useState } from "react";
import { Asset } from "expo-asset";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const source = require("@/assets/legal/privacy-policy.txt");
export type PolicyBlock = {
  type: "title" | "heading" | "bullet" | "paragraph";
  text: string;
};

const parse = (raw: string): PolicyBlock[] =>
  raw
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line): PolicyBlock => {
      if (line.startsWith("## "))
        return { type: "heading", text: line.slice(3) };
      if (line.startsWith("# ")) return { type: "title", text: line.slice(2) };
      if (line.startsWith("- ")) return { type: "bullet", text: line.slice(2) };
      return { type: "paragraph", text: line };
    });

export function usePrivacyPolicy() {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    (async () => {
      try {
        const [asset] = await Asset.loadAsync(source);
        const res = await fetch(asset.localUri ?? asset.uri);
        const body = await res.text();
        if (!cancelled) setText(body);
      } catch {
        if (!cancelled) setError("Không tải được chính sách quyền riêng tư.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const blocks = useMemo(() => (text ? parse(text) : []), [text]);

  return {
    blocks,
    error,
    isLoading: text === null && !error,
    retry: () => setAttempt((n) => n + 1),
  };
}
