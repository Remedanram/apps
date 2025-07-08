import api from "./api";

export interface Building {
  id: string;
  code: string;
  name: string;
  billerCode: string;
  createdAt: string;
}

export interface CreateBuildingRequest {
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

  // Create new building
  createBuilding: async (data: CreateBuildingRequest): Promise<Building> => {
    try {
      const response = await api.post("/buildings", data);
      console.log("Create building response:", response);
      if (response?.data) {
        return response.data;
      }
      throw new Error("Failed to create building");
    } catch (error) {
      console.error("Error in createBuilding:", error);
      throw error;
    }
  },

  getAvailableYears: async (buildingId: string): Promise<number[]> => {
    const response = await api.get(`/buildings/${buildingId}/years`);
    return response.data;
  },
};

export default buildingService;
