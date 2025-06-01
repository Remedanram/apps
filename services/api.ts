import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Use the IP address that works in Postman
const BASE_URL = "http://192.168.1.5:8888/api";

// Reduce timeout and add retry configuration
const TIMEOUT = 10000; // 10 seconds timeout
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second delay between retries

// Common headers for all requests
const getCommonHeaders = () => ({
  Accept: "application/json",
  "Content-Type": "application/json",
});

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
      ...getCommonHeaders(),
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    // Enhanced error logging
    const errorDetails = {
      url,
      method: options.method || "GET",
      retryCount,
      timestamp: new Date().toISOString(),
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : "Unknown error",
    };

    console.error("[API Request Failed]", errorDetails);

    // Implement retry logic
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying request (${retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithTimeout(url, options, retryCount + 1);
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

      const data = await response.json();
      return { data };
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

  async testConnection() {
    try {
      console.log("[Connection Test] Starting...");

      // First try a basic ping
      const pingStart = Date.now();
      const pingResponse = await fetch(`${BASE_URL}/health`, {
        method: "GET",
        headers: getCommonHeaders(),
      });
      const pingTime = Date.now() - pingStart;

      console.log("[Connection Test] Ping result:", {
        status: pingResponse.status,
        time: `${pingTime}ms`,
      });

      // Then try the actual rooms endpoint with retry logic
      const response = await fetchWithTimeout(`${BASE_URL}/rooms`, {
        method: "GET",
      });

      const data = await response.json();
      console.log("[Connection Test] Success:", {
        status: response.status,
        data,
        timestamp: new Date().toISOString(),
      });

      return true;
    } catch (error: unknown) {
      console.error("[Connection Test] Failed:", {
        message: error instanceof Error ? error.message : "Unknown error",
        url: `${BASE_URL}/rooms`,
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
