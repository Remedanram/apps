import api from "./api";

export interface Building {
  id: string;
  code: string;
  name: string;
  billerCode: string;
}

const buildingService = {
  // Get all buildings
  getAllBuildings: async (): Promise<Building[]> => {
    try {
      const response = await api.get("/buildings");
      console.log("Buildings response:", response);
      if (response?.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error in getAllBuildings:", error);
      throw error;
    }
  },
};

export default buildingService;
