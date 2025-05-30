import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiRequest, getAuthToken, getRefreshToken, get, post, put } from "./api";
import { refreshToken } from "./authService";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, "localStorage", { value: mockLocalStorage });

// Mock console methods to avoid noise in tests
console.log = vi.fn();
console.error = vi.fn();
console.warn = vi.fn();

// Mock toast
vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}));

// Mock authService
vi.mock("./authService", () => ({
  refreshToken: vi.fn(),
}));

describe("API Service", () => {
  const API_BASE_URL = "http://localhost:8000";
  const mockUserData = {
    access: "mock-access-token",
    refresh: "mock-refresh-token",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUserData));
    mockFetch.mockReset();
  });

  describe("Token Management", () => {
    it("gets auth token from localStorage", () => {
      const token = getAuthToken();
      expect(token).toBe(mockUserData.access);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("currentUser");
    });

    it("gets refresh token from localStorage", () => {
      const token = getRefreshToken();
      expect(token).toBe(mockUserData.refresh);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("currentUser");
    });

    it("handles invalid JSON in localStorage for auth token", () => {
      mockLocalStorage.getItem.mockReturnValue("invalid-json");
      const token = getAuthToken();
      expect(token).toBeNull();
    });

    it("handles invalid JSON in localStorage for refresh token", () => {
      mockLocalStorage.getItem.mockReturnValue("invalid-json");
      const token = getRefreshToken();
      expect(token).toBeNull();
    });

    it("returns null when no user data in localStorage", () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(getAuthToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe("API Request Function", () => {
    it("makes successful GET request with auth token", async () => {
      const mockResponse = { data: "test" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiRequest("/test", { method: "GET" });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/test`,
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockUserData.access}`,
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    it("handles non-JSON responses", async () => {
      const mockTextResponse = "text response";
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "text/plain" }),
        text: () => Promise.resolve(mockTextResponse),
      });

      const result = await apiRequest("/test", { method: "GET" });
      expect(result).toBe(mockTextResponse);
    });

    it("handles FormData requests correctly", async () => {
      const formData = new FormData();
      formData.append("test", "data");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({ success: true }),
      });

      await apiRequest("/test", { method: "POST", body: formData });

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/test`,
        expect.objectContaining({
          method: "POST",
          body: formData,
          headers: expect.not.objectContaining({
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    it("handles 401 response and retries with refreshed token", async () => {
      const mockNewToken = "new-access-token";
      const mockResponse = { data: "test" };

      // First call returns 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      // Mock successful token refresh
      (refreshToken as jest.Mock).mockResolvedValueOnce({
        access: mockNewToken,
      });

      // Second call (retry) succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiRequest("/test", { method: "GET" });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(refreshToken).toHaveBeenCalled();
    });

    it("throws error after max retries", async () => {
      // First call returns 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      // Mock failed token refresh
      (refreshToken as jest.Mock).mockRejectedValueOnce(
        new Error("Refresh failed"),
      );

      await expect(apiRequest("/test", { method: "GET" })).rejects.toThrow(
        "Authentication failed. Please log in again.",
      );
    });

    it("handles non-401 error responses", async () => {
      const errorMessage = "Bad Request";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify({ detail: errorMessage })),
      });

      await expect(apiRequest("/test", { method: "GET" })).rejects.toThrow(
        errorMessage,
      );
    });
  });

  describe("HTTP Method Helpers", () => {
    const mockResponse = { data: "test" };
    const successResponse = {
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve(mockResponse),
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue(successResponse);
    });

    it("makes GET request", async () => {
      await get("/test");
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/test`,
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("makes POST request with data", async () => {
      const data = { test: "data" };
      await post("/test", data);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/test`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(data),
        }),
      );
    });

    it("makes PUT request with data", async () => {
      const data = { test: "data" };
      await put("/test", data);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/test`,
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(data),
        }),
      );
    });
  });
}); 