import api from "./api";

export interface Transaction {
  id: number;
  bankTxnId: string;
  txnDate: string;
  amount: number;
  senderName: string;
  senderPhone: string;
  description: string;
  importedAt: string;
}

const transactionService = {
  // Get recent transactions for a specific building
  getRecentTransactions: async (buildingId: string): Promise<Transaction[]> => {
    try {
      const response = await api.get(
        `/buildings/${buildingId}/transactions/recent`
      );
      console.log("getRecentTransactions response:", response);
      if (response?.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error in getRecentTransactions:", error);
      throw error;
    }
  },

  // Get all transactions for a specific building
  getAllTransactions: async (buildingId: string): Promise<Transaction[]> => {
    try {
      const response = await api.get(
        `/buildings/${buildingId}/transactions/all`
      );
      console.log("getAllTransactions response:", response);
      if (response?.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error in getAllTransactions:", error);
      throw error;
    }
  },

  // Get the base URL for debugging
  getBaseUrl: () => {
    return api.getBaseUrl();
  },
};

export default transactionService;
