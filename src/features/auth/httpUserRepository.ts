import type { AxiosInstance } from "axios";
import { buildImageForm } from "@/core/http/multipart";

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
    const { data } = await this.privateHttp.put<UserResponse>(
      "/v1/users/me",
      body,
    );
    return data;
  };

  updateAvatar = async (image: PickedImage): Promise<UserResponse> => {
    const form = await buildImageForm("avatar", image, "avatar.jpg");

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
