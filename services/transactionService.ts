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
  // Get recent transactions
  getRecentTransactions: async (): Promise<Transaction[]> => {
    try {
      const response = await api.get("/transactions/recentTransactions");
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

  // Get all transactions
  getAllTransactions: async (): Promise<Transaction[]> => {
    try {
      const response = await api.get("/transactions/allTransactions");
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
