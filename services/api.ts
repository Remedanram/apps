import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Use the IP address that works in Postman
const BASE_URL = "http://192.168.20.24:8888/api";

// Increase timeout for slower connections
const TIMEOUT = 30000; // 30 seconds timeout

// Common headers for all requests
const getCommonHeaders = () => ({
  Accept: "application/json",
  "Content-Type": "application/json",
});

// Helper function to add timeout to fetch
const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
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

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${TIMEOUT}ms`);
      }
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
};

const api = {
  async get(endpoint: string) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, {
        method: "GET",
      });

      const data = await response.json();
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

      // Then try the actual rooms endpoint
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
