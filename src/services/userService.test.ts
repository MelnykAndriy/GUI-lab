import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getCurrentUser,
  getUserByEmail,
  updateUser,
  uploadAvatar,
} from "./userService";
import { get, put, apiRequest } from "./api";

// Mock the API module
vi.mock("./api", () => ({
  get: vi.fn(),
  put: vi.fn(),
  apiRequest: vi.fn(),
}));

describe("userService", () => {
  const mockUser = {
    id: 1,
    email: "test@example.com",
    profile: {
      name: "Test User",
      gender: "other",
      dob: "1990-01-01",
      createdAt: "2024-01-01T00:00:00Z",
      avatarUrl: "https://example.com/avatar.jpg",
      avatarColor: "#000000",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentUser", () => {
    it("should fetch current user successfully", async () => {
      (get as any).mockResolvedValueOnce(mockUser);

      const result = await getCurrentUser();

      expect(get).toHaveBeenCalledWith("/api/users/me/");
      expect(result).toEqual(mockUser);
    });

    it("should handle error when fetching current user fails", async () => {
      const error = new Error("Failed to fetch user");
      (get as any).mockRejectedValueOnce(error);

      await expect(getCurrentUser()).rejects.toThrow("Failed to fetch user");
      expect(get).toHaveBeenCalledWith("/api/users/me/");
    });
  });

  describe("getUserByEmail", () => {
    it("should fetch user by email successfully", async () => {
      (get as any).mockResolvedValueOnce(mockUser);
      const email = "test@example.com";

      const result = await getUserByEmail(email);

      expect(get).toHaveBeenCalledWith(`/api/users/search/${email}/`);
      expect(result).toEqual(mockUser);
    });

    it("should handle error when fetching user by email fails", async () => {
      const error = new Error("User not found");
      (get as any).mockRejectedValueOnce(error);
      const email = "nonexistent@example.com";

      await expect(getUserByEmail(email)).rejects.toThrow("User not found");
      expect(get).toHaveBeenCalledWith(`/api/users/search/${email}/`);
    });
  });

  describe("updateUser", () => {
    it("should update user profile successfully", async () => {
      const updateData = {
        profile: {
          name: "Updated Name",
          gender: "female",
        },
      };
      const updatedUser = {
        ...mockUser,
        profile: { ...mockUser.profile, ...updateData.profile },
      };
      (put as any).mockResolvedValueOnce(updatedUser);

      const result = await updateUser(updateData);

      expect(put).toHaveBeenCalledWith("/api/users/me/", updateData);
      expect(result).toEqual(updatedUser);
    });

    it("should handle error when updating user fails", async () => {
      const updateData = {
        profile: {
          name: "Updated Name",
        },
      };
      const error = new Error("Update failed");
      (put as any).mockRejectedValueOnce(error);

      await expect(updateUser(updateData)).rejects.toThrow("Update failed");
      expect(put).toHaveBeenCalledWith("/api/users/me/", updateData);
    });
  });

  describe("uploadAvatar", () => {
    it("should upload avatar successfully", async () => {
      const file = new File([""], "avatar.jpg", { type: "image/jpeg" });
      const response = { avatarUrl: "https://example.com/new-avatar.jpg" };
      (apiRequest as any).mockResolvedValueOnce(response);

      const result = await uploadAvatar(file);

      expect(apiRequest).toHaveBeenCalledWith("/api/users/me/avatar", {
        method: "POST",
        body: expect.any(FormData),
        headers: {},
      });
      expect(result).toEqual(response);
    });

    it("should handle error when avatar upload fails", async () => {
      const file = new File([""], "avatar.jpg", { type: "image/jpeg" });
      const error = new Error("Upload failed");
      (apiRequest as any).mockRejectedValueOnce(error);

      await expect(uploadAvatar(file)).rejects.toThrow("Upload failed");
      expect(apiRequest).toHaveBeenCalledWith("/api/users/me/avatar", {
        method: "POST",
        body: expect.any(FormData),
        headers: {},
      });
    });
  });
});
