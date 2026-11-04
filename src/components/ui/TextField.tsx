import React from "react";
import type { TextInputProps } from "react-native";
import { AppInput } from "./AppInput";

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
  className?: string;
}

export function TextField({ label, error, ...props }: TextFieldProps) {
  return <AppInput label={label} error={error} {...props} />;
}
