import { toast } from "@/components/ui/use-toast";
import { refreshToken } from "./authService";

const API_BASE_URL = "http://localhost:8000";

interface ApiOptions {
  method: string;
  headers?: Record<string, string>;
  body?: any;
}

// Get the auth token from localStorage
export const getAuthToken = (): string | null => {
  const userData = localStorage.getItem("currentUser");
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user.access || null;
    } catch (error) {
      console.error("Failed to parse user data:", error);
      return null;
    }
  }
  return null;
};

// Get the refresh token from localStorage
export const getRefreshToken = (): string | null => {
  const userData = localStorage.getItem("currentUser");
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user.refresh || null;
    } catch (error) {
      console.error("Failed to parse user data:", error);
      return null;
    }
  }
  return null;
};

// Update tokens in localStorage
const updateTokensInStorage = (access: string, refresh?: string) => {
  const userData = localStorage.getItem("currentUser");
  if (userData) {
    try {
      const user = JSON.parse(userData);
      user.access = access;
      if (refresh) {
        user.refresh = refresh;
      }
      localStorage.setItem("currentUser", JSON.stringify(user));
      console.log("Tokens updated in localStorage");
    } catch (error) {
      console.error("Failed to update tokens in localStorage:", error);
    }
  }
};

// Handle token refresh
const handleTokenRefresh = async (): Promise<string | null> => {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    console.error("No refresh token available");
    return null;
  }

  try {
    console.log("Attempting to refresh access token...");
    const response = await refreshToken(refreshTokenValue);
    
    if (response.access) {
      updateTokensInStorage(response.access, response.refresh);
      console.log("Access token refreshed successfully");
      return response.access;
    }
    
    return null;
  } catch (error) {
    console.error("Token refresh failed:", error);
    // Clear invalid tokens and redirect to login
    localStorage.removeItem("currentUser");
    window.location.href = "/login";
    return null;
  }
};

// API request function that includes auth token and handles refresh
export const apiRequest = async (
  endpoint: string,
  options: ApiOptions,
  retryCount = 0,
  maxRetries = 1 // default: 1 retry (1 refresh attempt)
) => {
  const token = getAuthToken();
  let headers: Record<string, string> = {
    ...options.headers,
  };

  // Only set Content-Type if not sending FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Add Authorization header with token
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log(`Request to ${endpoint} includes auth token:`, !!token);
  } else {
    console.warn(`No auth token available for request to ${endpoint}`);
  }

  const config: RequestInit = {
    method: options.method,
    headers,
  };

  if (options.body) {
    config.body = options.body instanceof FormData ? options.body : JSON.stringify(options.body);
  }

  try {
    console.log(`Making ${options.method} request to ${endpoint} with auth:`, !!token);
    console.log("Full URL:", `${API_BASE_URL}${endpoint}`);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 Unauthorized - try token refresh only once per request
    if (response.status === 401) {
      if (retryCount < maxRetries) {
        console.log("Received 401, attempting token refresh...");
        updateTokensInStorage("");
        const newToken = await handleTokenRefresh();
        if (newToken) {
          // Retry the request with the new token
          console.log("Retrying request with refreshed token...");
          return apiRequest(endpoint, options, retryCount + 1, maxRetries);
        } else {
          // Do NOT retry, just throw and let the redirect happen
          throw new Error("Authentication failed. Please log in again.");
        }
      } else {
        // Already retried maxRetries times, do not refresh again, just throw
        throw new Error("Authentication failed. Please log in again.");
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { detail: errorText || "Unknown error" };
      }
      console.error("API error:", errorData);
      throw new Error(errorData.detail || errorData.message || "Something went wrong");
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error: any) {
    console.error("API Request Error:", error);

    // Don't show toast for data fetching errors to avoid flooding the UI
    if (options.method !== "GET") {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred",
      });
    }

    throw error;
  }
};

export const get = (endpoint: string, maxRetries = 1) => {
  return apiRequest(endpoint, { method: "GET" }, 0, maxRetries);
};

export const post = (endpoint: string, data: any, maxRetries = 1) => {
  return apiRequest(endpoint, { method: "POST", body: data }, 0, maxRetries);
};

export const put = (endpoint: string, data: any, maxRetries = 1) => {
  return apiRequest(endpoint, { method: "PUT", body: data }, 0, maxRetries);
};
