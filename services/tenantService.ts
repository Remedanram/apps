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
    id: number,
    tenantData: Partial<Tenant>
  ): Promise<Tenant> => {
    try {
      const response = await api.put(`/tenants/${id}`, tenantData);
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
  deleteTenant: async (id: number): Promise<void> => {
    try {
      const response = await api.delete(`/tenants/${id}`);
      console.log("deleteTenant response:", response);
      if (!response?.data) {
        throw new Error("Failed to delete tenant");
      }
    } catch (error) {
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
