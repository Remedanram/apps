import api from "./api";

export enum TenantStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface Tenant {
  id: number;
  name: string;
  phone: string;
  email: string;
  moveInDate: string;
  moveOutDate: string | null;
  status: TenantStatus;
  room: {
    roomName: string;
    rentAmount: number;
    description: string;
    active: boolean;
    occupied: boolean;
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
  email: string;
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
      const tenants = await tenantService.getAllTenants();
      console.log("getTotalTenants response:", tenants);

      const stats = {
        totalTenants: tenants.length,
        activeTenants: tenants.filter((t) => t.status === TenantStatus.ACTIVE)
          .length,
        inactiveTenants: tenants.filter(
          (t) => t.status === TenantStatus.INACTIVE
        ).length,
      };

      return stats;
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
        email: tenantData.email || "",
        status: tenantData.status || TenantStatus.ACTIVE,
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
  deleteTenant: async (roomName: string, phone: string): Promise<void> => {
    try {
      await api.delete(`/tenants/${roomName}/${phone}`);
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

  // Deactivate a tenant
  deactivateTenant: async (roomName: string): Promise<void> => {
    try {
      const response = await api.put(`/tenants/${roomName}/deactivate`, {
        status: TenantStatus.INACTIVE,
      });

      // The backend returns 200 OK with no body on success
      // If we get here, the deactivation was successful
      return;
    } catch (error: any) {
      // If the error has a response with a message, use that
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      console.error("Error in deactivateTenant:", error);
      throw error;
    }
  },

  // Get the base URL for debugging
  getBaseUrl: () => {
    return api.getBaseUrl();
  },
};

export default tenantService;
