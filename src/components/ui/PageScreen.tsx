import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { PageHeader } from "./PageHeader";
import { Screen } from "./Screen";

interface PageScreenProps {
  title: string;
  /** Nút phụ ở bên phải tiêu đề (ví dụ nút "+"). */
  right?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Khung cho màn hình con (không nằm trong tab): tiêu đề + nút quay lại + tránh bàn phím. */
export function PageScreen({ title, right, className, children }: PageScreenProps) {
  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen className={className}>
        <PageHeader title={title} right={right} />
        {children}
      </Screen>
    </KeyboardAvoidingView>
  );
}
