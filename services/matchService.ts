import api from "./api";
import { useBuilding } from "../contexts/BuildingContext";

export interface MatchRoom {
  roomName: string;
  tenantName: string;
  phone: string;
  amount: number;
  day: string | null;
  status:
    | "MATCHED_EXACT"
    | "MATCHED_OVERPAID"
    | "PENDING_UNDERPAID"
    | "PENDING";
}

const matchService = {
  // Get available years from transactions
  getAvailableYears: async (buildingId: string): Promise<number[]> => {
    try {
      const response = await api.get(
        `/buildings/${buildingId}/transactions/years`
      );
      if (response?.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error in getAvailableYears:", error);
      throw error;
    }
  },

  // Get total revenue for a specific period (YYYY-MM)
  getTotalRevenue: async (
    buildingId: string,
    period: string
  ): Promise<number> => {
    try {
      const response = await api.get(
        `/buildings/${buildingId}/matches/total-paid?period=${period}`
      );
      if (response?.data !== undefined) {
        return response.data;
      }
      return 0;
    } catch (error) {
      console.error("Error in getTotalRevenue:", error);
      throw error;
    }
  },

  // Get paid rooms for a specific period (YYYY-MM)
  getPaidRooms: async (
    buildingId: string,
    period: string
  ): Promise<MatchRoom[]> => {
    try {
      const response = await api.get(
        `/buildings/${buildingId}/matches/paid-rooms?period=${period}`
      );
      if (response?.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error in getPaidRooms:", error);
      throw error;
    }
  },

  // Get unpaid rooms for a specific period (YYYY-MM)
  getUnpaidRooms: async (
    buildingId: string,
    period: string
  ): Promise<MatchRoom[]> => {
    try {
      console.log("Fetching unpaid rooms for period:", period);
      const response = await api.get(
        `/buildings/${buildingId}/matches/unpaid-rooms?period=${period}`
      );
      console.log("API response:", response);
      if (response?.data) {
        console.log("Parsed data:", response.data);
        return response.data;
      }
      console.log("No data in response");
      return [];
    } catch (error) {
      console.error("Error in getUnpaidRooms:", error);
      throw error;
    }
  },

  // Get paid rooms count for a specific period (YYYY-MM)
  getPaidCount: async (buildingId: string, period: string): Promise<number> => {
    try {
      const response = await api.get(
        `/buildings/${buildingId}/matches/paid-count?period=${period}`
      );
      if (response?.data !== undefined) {
        return response.data;
      }
      return 0;
    } catch (error) {
      console.error("Error in getPaidCount:", error);
      throw error;
    }
  },

  // Get unpaid rooms count for a specific period (YYYY-MM)
  getUnpaidCount: async (
    buildingId: string,
    period: string
  ): Promise<number> => {
    try {
      const response = await api.get(
        `/buildings/${buildingId}/matches/unpaid-count?period=${period}`
      );
      if (response?.data !== undefined) {
        return response.data;
      }
      return 0;
    } catch (error) {
      console.error("Error in getUnpaidCount:", error);
      throw error;
    }
  },
};

export default matchService;
