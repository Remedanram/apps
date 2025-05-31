import api from "./api";

export interface Tenant {
  id: number;
  name: string;
  phone: string;
  moveInDate: string;
  moveOutDate: string | null;
  room: {
    roomName: string;
    rentAmount: number;
    description: string;
    active: boolean;
  };
}

export interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
}

export interface CreateTenantRequest {
  name: string;
  phone: string;
  roomName: string;
}

const tenantService = {
  // Get all tenants
  getAllTenants: async (): Promise<Tenant[]> => {
    try {
      const response = await api.get("/tenants");
      console.log("getAllTenants response:", response);
      if (response?.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error in getAllTenants:", error);
      throw error;
    }
  },

  // Create a new tenant
  createTenant: async (tenantData: CreateTenantRequest): Promise<Tenant> => {
    try {
      const response = await api.post("/tenants", tenantData);
      console.log("createTenant response:", response);
      if (response?.data) {
        return response.data;
      }
      throw new Error("Failed to create tenant");
    } catch (error) {
      console.error("Error in createTenant:", error);
      throw error;
    }
  },

  // Get total number of tenants
  getTotalTenants: async (): Promise<TenantStats> => {
    try {
      const response = await api.get("/tenants/totalTenants");
      console.log("getTotalTenants response:", response);
      if (response?.data) {
        // Convert the number response to TenantStats format
        return {
          totalTenants: response.data,
          activeTenants: response.data, // Since we don't have this info, using total as active
          inactiveTenants: 0, // Since we don't have this info, defaulting to 0
        };
      }
      throw new Error("Failed to get tenant stats");
    } catch (error) {
      console.error("Error in getTotalTenants:", error);
      throw error;
    }
  },

  // Update a tenant
  updateTenant: async (
    roomName: string,
    tenantData: Partial<Tenant>
  ): Promise<Tenant> => {
    try {
      // Format the data to match the server's expected format
      const updateData = {
        name: tenantData.name || "",
        moveInDate: tenantData.moveInDate
          ? new Date(tenantData.moveInDate).toISOString().split("T")[0]
          : "",
        moveOutDate: tenantData.moveOutDate
          ? new Date(tenantData.moveOutDate).toISOString().split("T")[0]
          : "",
        roomName: roomName,
        phone: tenantData.phone || "",
      };

      const response = await api.put(`/tenants/${roomName}`, updateData);
      console.log("updateTenant response:", response);
      if (response?.data) {
        return response.data;
      }
      throw new Error("Failed to update tenant");
    } catch (error) {
      console.error("Error in updateTenant:", error);
      throw error;
    }
  },

  // Delete a tenant
  deleteTenant: async (roomName: string): Promise<void> => {
    try {
      await api.delete(`/tenants/${roomName}`);
      // If we get here, the deletion was successful
      return;
    } catch (error: any) {
      // Check if this is a JSON parse error with empty response
      if (
        error.message?.includes("JSON Parse error") &&
        error.message?.includes("Unexpected end of input")
      ) {
        // This is actually a success case - the server returned empty response
        return;
      }
      console.error("Error in deleteTenant:", error);
      throw error;
    }
  },

  // Get the base URL for debugging
  getBaseUrl: () => {
    return api.getBaseUrl();
  },
};

export default tenantService;
