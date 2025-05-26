import { post } from "./api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  gender?: string;
  dob?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
  return post("/api/users/login/", data);
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  return post("/api/users/register/", data);
};

export const refreshToken = async (refreshToken: string) => {
  // No retries for refresh token endpoint
  return post("/api/users/token/refresh/", { refresh: refreshToken }, 0);
};
