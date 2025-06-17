import api from "./api";

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const authService = {
  // Signup new user
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post("/auth/signup", data);
      if (response?.data) {
        return response.data;
      }
      throw new Error("Failed to signup");
    } catch (error) {
      console.error("Error in signup:", error);
      throw error;
    }
  },

  // Login user
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post("/auth/login", data);
      console.log("Login response:", response);

      // Check if we have a valid response with token
      if (response?.data?.token) {
        return {
          token: response.data.token,
          user: {
            id: response.data.user?.id || 0,
            name: response.data.user?.name || "",
            email: response.data.user?.email || data.email,
          },
        };
      }
      throw new Error("Invalid login response");
    } catch (error) {
      console.error("Error in login:", error);
      throw error;
    }
  },
};

export default authService;
