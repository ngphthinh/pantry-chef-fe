import { Platform } from "react-native";
import type { PickedImage } from "@/types";

/** Tạo FormData chứa một ảnh. Web cần Blob thật, native nhận object { uri, name, type }. */
export async function buildImageForm(
  field: string,
  image: PickedImage,
  defaultName: string,
): Promise<FormData> {
  const name = image.fileName ?? defaultName;
  const type = image.mimeType ?? "image/jpeg";
  const form = new FormData();

  if (Platform.OS === "web") {
    const blob = await (await fetch(image.uri)).blob();
    form.append(field, blob, name);
  } else {
    form.append(field, { uri: image.uri, name, type } as unknown as Blob);
  }
  return form;
}
