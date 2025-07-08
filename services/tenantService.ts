import api from "./api";
import type { Tenant, CreateTenantRequest } from "../types/tenant";
import { TenantStatus } from "../types/tenant";

export interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
}

export interface DueAmountDetails {
  tenantCode: string;
  tenantName: string;
  roomName: string;
  moveInDate: string;
  billingMonth: string;
  amountDue: number;
  nextBillingStart: string;
}

const tenantService = {
  // Get all tenants for a specific building
  getAllTenants: async (buildingId: string): Promise<Tenant[]> => {
    try {
      const response = await api.get(`/buildings/${buildingId}/tenants`);
      console.log("getAllTenants response:", response);
      if (response?.data) {
        // Map backend response to UI model
        return response.data.map((tenant: any) => ({
          id: tenant.id, // use the real tenant UUID from backend
          tenantCode: tenant.tenantCode, // keep tenantCode for display if needed
          name: tenant.name,
          phone: tenant.phone,
          email: tenant.email,
          moveInDate: tenant.moveInDate,
          moveOutDate: tenant.moveOutDate,
          status: tenant.status,
          description: tenant.description,
          room: {
            id: tenant.roomId, // use the real room UUID from backend
            roomName: tenant.roomName,
            rentAmount: tenant.rentAmount,
            description: "", // Not provided by backend, set default
            active: true, // Not provided by backend, set default
            occupied: true, // Not provided by backend, set default
          },
        }));
      }
      return [];
    } catch (error) {
      console.error("Error in getAllTenants:", error);
      throw error;
    }
  },

  // Create a new tenant in a room
  createTenant: async (
    buildingId: string,
    roomId: string,
    tenantData: CreateTenantRequest
  ): Promise<Tenant> => {
    try {
      const response = await api.post(
        `/buildings/${buildingId}/rooms/${roomId}/tenant`,
        tenantData
      );
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

  // Get total number of tenants for a specific building
  getTotalTenants: async (buildingId: string): Promise<TenantStats> => {
    try {
      const tenants = await tenantService.getAllTenants(buildingId);
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

  // Update a tenant in a specific building
  updateTenant: async (
    buildingId: string,
    roomId: string,
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
        phone: tenantData.phone || "",
        email: tenantData.email || "",
        status: tenantData.status || TenantStatus.ACTIVE,
        description: tenantData.description || "",
      };

      const response = await api.put(
        `/buildings/${buildingId}/rooms/${roomId}/tenant`,
        updateData
      );
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

  // Delete a tenant from a specific building
  deleteTenant: async (
    buildingId: string,
    roomId: string,
    tenantId: string
  ): Promise<void> => {
    try {
      await api.delete(
        `/buildings/${buildingId}/rooms/${roomId}/tenant/${tenantId}`
      );
      return;
    } catch (error: any) {
      if (
        error.message?.includes("JSON Parse error") &&
        error.message?.includes("Unexpected end of input")
      ) {
        return;
      }
      console.error("Error in deleteTenant:", error);
      throw error;
    }
  },

  // Deactivate a tenant
  deactivateTenant: async (
    buildingId: string,
    roomId: string
  ): Promise<void> => {
    try {
      await api.put(
        `/buildings/${buildingId}/rooms/${roomId}/tenant/deactivate`,
        { status: TenantStatus.INACTIVE }
      );
      return;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      console.error("Error in deactivateTenant:", error);
      throw error;
    }
  },

  // Activate a tenant
  activateTenant: async (buildingId: string, roomId: string): Promise<void> => {
    try {
      await api.put(
        `/buildings/${buildingId}/rooms/${roomId}/tenant/activate`,
        { status: TenantStatus.ACTIVE }
      );
      return;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      console.error("Error in activateTenant:", error);
      throw error;
    }
  },

  // Get the base URL for debugging
  getBaseUrl: () => {
    return api.getBaseUrl();
  },

  getTenantByPhone: async (phone: string, buildingId: number) => {
    const response = await api.get(
      `/tenant/phone/${phone}?buildingId=${buildingId}`
    );
    return response.data;
  },

  getTenantDue: async (tenantCode: string): Promise<DueAmountDetails> => {
    const response = await api.get(`/tenant/${tenantCode}/due`);
    return response.data.data;
  },
};

export default tenantService;
