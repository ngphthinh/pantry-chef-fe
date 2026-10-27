import type { AxiosInstance } from "axios";
import { Platform } from "react-native";

import type {
  ApiResponse,
  PickedImage,
  UserResponse,
  UserUpdateRequest,
} from "@/types";
import type { IUserApi } from "./types";

export class HttpUserRepository implements IUserApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  getMe = async (): Promise<UserResponse> => {
    const { data } = await this.privateHttp.get<UserResponse>("/v1/users/me");
    return data;
  };

  updateMe = async (body: UserUpdateRequest): Promise<UserResponse> => {
    const { data } = await this.privateHttp.put<ApiResponse<UserResponse>>(
      "/v1/users/me",
      body,
    );
    return data.data;
  };

  updateAvatar = async (image: PickedImage): Promise<UserResponse> => {
    const name = image.fileName ?? "avatar.jpg";
    const type = image.mimeType ?? "image/jpeg";
    const form = new FormData();

    if (Platform.OS === "web") {
      // Web cần Blob thật, không nhận object { uri, name, type }
      const blob = await (await fetch(image.uri)).blob();
      form.append("avatar", blob, name);
    } else {
      form.append("avatar", { uri: image.uri, name, type } as unknown as Blob);
    }

    const { data } = await this.privateHttp.put("/v1/users/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
    return data;
  };

  deleteMe = async (): Promise<void> => {
    await this.privateHttp.delete("/v1/users/me"); // 204, không có body
  };
}
