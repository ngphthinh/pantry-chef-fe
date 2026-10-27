import type { PickedImage, UserResponse, UserUpdateRequest } from "@/types";
import type { IUserApi } from "./types";

export class UserService {
  constructor(private readonly users: IUserApi) {}

  getMe = (): Promise<UserResponse> => this.users.getMe();

  updateMe = (body: UserUpdateRequest): Promise<UserResponse> =>
    this.users.updateMe(body);

  updateAvatar = (image: PickedImage): Promise<UserResponse> =>
    this.users.updateAvatar(image);

  deleteMe = (): Promise<void> => this.users.deleteMe();
}
