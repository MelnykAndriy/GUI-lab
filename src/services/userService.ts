import { get, put, apiRequest } from "./api";

export interface UserProfile {
  name: string;
  gender?: string;
  dob?: string;
  createdAt: string;
  avatarUrl?: string;
  avatarColor?: string;
}

export interface User {
  id: number;
  email: string;
  profile: UserProfile;
}

export interface UserUpdateData {
  profile?: Partial<UserProfile>;
}

export interface UploadAvatarResponse {
  avatarUrl: string;
}

export const getCurrentUser = async (): Promise<User> => {
  return get("/api/users/me/");
};

export const getUserByEmail = async (email: string): Promise<User> => {
  return get(`/api/users/search/${email}/`);
};

export const updateUser = async (data: UserUpdateData): Promise<User> => {
  return put("/api/users/me/", data);
};

export const uploadAvatar = async (
  file: File,
): Promise<UploadAvatarResponse> => {
  const formData = new FormData();
  formData.append("avatar", file);
  return apiRequest("/api/users/me/avatar", {
    method: "POST",
    body: formData,
    headers: {},
  });
};
