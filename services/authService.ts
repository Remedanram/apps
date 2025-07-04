import api from "./api";

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  billerCode: string;
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
    billerCode?: string;
  };
}

// Profile management functions
export const getProfile = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

export const updateProfile = async (
  userId: string,
  profileData: { name: string; email: string; billerCode: string }
) => {
  try {
    const response = await api.put(`/auth/edit/${userId}`, profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const changePassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
}) => {
  try {
    const response = await api.post("/auth/change-password", passwordData);
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

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
