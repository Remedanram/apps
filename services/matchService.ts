import api from "./api";

export interface MatchRoom {
  roomName: string;
  tenantName: string;
  amount: number;
  day: string;
  status: "MATCHED_EXACT" | "MATCHED_OVERPAID" | "PENDING_UNDERPAID";
}

const matchService = {
  // Get paid rooms for a specific month
  getPaidRooms: async (month: string): Promise<MatchRoom[]> => {
    try {
      const response = await api.get(`/matches/paid-rooms?month=${month}`);
      if (response?.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error in getPaidRooms:", error);
      throw error;
    }
  },

  // Get unpaid rooms for a specific month
  getUnpaidRooms: async (month: string): Promise<MatchRoom[]> => {
    try {
      const response = await api.get(`/matches/unpaid-rooms?month=${month}`);
      if (response?.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error in getUnpaidRooms:", error);
      throw error;
    }
  },

  // Get paid rooms count for a specific month
  getPaidCount: async (month: string): Promise<number> => {
    try {
      const response = await api.get(`/matches/paid-count?month=${month}`);
      if (response?.data !== undefined) {
        return response.data;
      }
      return 0;
    } catch (error) {
      console.error("Error in getPaidCount:", error);
      throw error;
    }
  },

  // Get unpaid rooms count for a specific month
  getUnpaidCount: async (month: string): Promise<number> => {
    try {
      const response = await api.get(`/matches/unpaid-count?month=${month}`);
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
