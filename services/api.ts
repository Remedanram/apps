import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Use the IP address that works in Postman
const BASE_URL = "http://192.168.20.61:8888/api";

// Reduce timeout and add retry configuration
const TIMEOUT = 10000; // 10 seconds timeout
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second delay between retries

// Common headers for all requests
const getCommonHeaders = async () => {
  const token = await AsyncStorage.getItem("userToken");
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper function to add timeout to fetch with retry logic
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  retryCount = 0
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.warn(`Request to ${url} timed out after ${TIMEOUT}ms`);
  }, TIMEOUT);

  try {
    // Log the request attempt
    console.log("[API Request Started]", {
      url,
      method: options.method || "GET",
      retryCount,
      timestamp: new Date().toISOString(),
    });

    // Merge common headers with provided headers
    const headers = {
      ...(await getCommonHeaders()),
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Log successful response
    console.log("[API Response Success]", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      timestamp: new Date().toISOString(),
    });

    // Check if response is ok
    if (!response.ok) {
      // Try to parse the error response as JSON
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `HTTP error! status: ${response.status}` };
      }
      throw { response: { data: errorData, status: response.status } };
    }

    return response;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    // Implement retry logic
    if (retryCount < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithTimeout(url, options, retryCount + 1);
    }

    // If we have an error response with data, throw it
    if (error && typeof error === "object" && "response" in error) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(
          `Request timeout after ${TIMEOUT}ms (${MAX_RETRIES} retries attempted)`
        );
      }
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
};

const api = {
  async get(endpoint: string) {
    try {
      console.log("[API GET] Requesting:", `${BASE_URL}${endpoint}`);
      const response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, {
        method: "GET",
      });

      console.log("[API GET] Raw response:", response);
      const data = await response.json();
      console.log("[API GET] Parsed data:", data);
      return { data };
    } catch (error: unknown) {
      console.error("[API GET Error]", {
        message: error instanceof Error ? error.message : "Unknown error",
        endpoint,
        url: `${BASE_URL}${endpoint}`,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  async post(endpoint: string, body: any) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return { data };
    } catch (error: unknown) {
      console.error("[API POST Error]", {
        message: error instanceof Error ? error.message : "Unknown error",
        endpoint,
        url: `${BASE_URL}${endpoint}`,
        body,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  async put(endpoint: string, body: any) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      // Check content type to determine how to parse the response
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return { data };
      } else {
        // For non-JSON responses, return the text
        const text = await response.text();
        return { data: text };
      }
    } catch (error: unknown) {
      console.error("[API PUT Error]", {
        message: error instanceof Error ? error.message : "Unknown error",
        endpoint,
        url: `${BASE_URL}${endpoint}`,
        body,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  async delete(endpoint: string) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, {
        method: "DELETE",
      });

      // For DELETE requests, we don't need to parse the response if it's empty
      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return { data: null };
      }

      const data = await response.json();
      return { data };
    } catch (error: unknown) {
      console.error("[API DELETE Error]", {
        message: error instanceof Error ? error.message : "Unknown error",
        endpoint,
        url: `${BASE_URL}${endpoint}`,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  async testConnection(buildingId?: string) {
    try {
      console.log("[Connection Test] Starting...");

      // First try a basic ping
      const pingStart = Date.now();
      const pingResponse = await fetch(`${BASE_URL}/health`, {
        method: "GET",
        headers: await getCommonHeaders(),
      });
      const pingTime = Date.now() - pingStart;

      console.log("[Connection Test] Ping result:", {
        status: pingResponse.status,
        time: `${pingTime}ms`,
      });

      // If buildingId is provided, test a building-specific endpoint
      if (buildingId) {
        const response = await fetchWithTimeout(
          `${BASE_URL}/buildings/${buildingId}/rooms`,
          {
            method: "GET",
          }
        );
        const data = await response.json();
        console.log("[Connection Test] Success:", {
          status: response.status,
          data,
          timestamp: new Date().toISOString(),
        });
      }

      return true;
    } catch (error: unknown) {
      console.error("[Connection Test] Failed:", {
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
      return false;
    }
  },

  getBaseUrl() {
    return BASE_URL;
  },
};

export default api;
