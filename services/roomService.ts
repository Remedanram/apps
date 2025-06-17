import api from "./api";
import type {
  Room,
  RoomResponse,
  RoomStats,
  CreateRoomRequest,
} from "../types/room";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface RoomFilters {
  status?: string;
  tenant?: string;
  search?: string;
}

interface RoomCount {
  occupiedCount: number;
  vacantCount: number;
}

const roomService = {
  // Get all rooms for a specific building
  getAllRooms: async (buildingId: string): Promise<Room[]> => {
    try {
      const response = await api.get(`/buildings/${buildingId}/rooms`);
      console.log("getAllRooms response:", response);
      if (response?.data) {
        // Check if the response is wrapped in a data property
        const rooms = Array.isArray(response.data)
          ? response.data
          : response.data.data
          ? response.data.data
          : [];
        return rooms;
      }
      return [];
    } catch (error) {
      console.error("Error in getAllRooms:", error);
      throw error;
    }
  },

  // Get room counts for a specific building
  getRoomCounts: async (buildingId: string): Promise<RoomCount> => {
    try {
      const response = await api.get(`/buildings/${buildingId}/rooms/count`);
      console.log("getRoomCounts response:", response);
      if (response?.data) {
        return {
          occupiedCount: response.data.occupiedCount || 0,
          vacantCount: response.data.vacantCount || 0,
        };
      }
      return { occupiedCount: 0, vacantCount: 0 };
    } catch (error) {
      console.error("Error in getRoomCounts:", error);
      throw error;
    }
  },

  // Get vacant rooms for a specific building
  getVacantRooms: async (buildingId: string): Promise<number> => {
    try {
      const counts = await roomService.getRoomCounts(buildingId);
      return counts.vacantCount;
    } catch (error) {
      console.error("Error in getVacantRooms:", error);
      throw error;
    }
  },

  // Get occupied rooms for a specific building
  getOccupiedRooms: async (buildingId: string): Promise<number> => {
    try {
      const counts = await roomService.getRoomCounts(buildingId);
      return counts.occupiedCount;
    } catch (error) {
      console.error("Error in getOccupiedRooms:", error);
      throw error;
    }
  },

  // Create a new room in a building
  createRoom: async (
    buildingId: string,
    roomData: CreateRoomRequest
  ): Promise<Room> => {
    try {
      const response = await api.post(
        `/buildings/${buildingId}/rooms`,
        roomData
      );
      console.log("createRoom response:", response);
      if (response?.data) {
        return response.data;
      }
      throw new Error("Failed to create room");
    } catch (error) {
      console.error("Error in createRoom:", error);
      throw error;
    }
  },

  // Get total number of rooms for a specific building
  getTotalRooms: async (buildingId: string): Promise<RoomStats> => {
    try {
      const counts = await roomService.getRoomCounts(buildingId);
      return {
        totalRooms: counts.occupiedCount + counts.vacantCount,
        activeRooms: counts.occupiedCount + counts.vacantCount, // Since we don't have this info, using total
        inactiveRooms: 0, // Since we don't have this info, defaulting to 0
      };
    } catch (error) {
      console.error("Error in getTotalRooms:", error);
      throw error;
    }
  },

  // Get vacant rooms list for a specific building
  getVacantRoomsList: async (buildingId: string): Promise<Room[]> => {
    try {
      const response = await api.get(`/buildings/${buildingId}/rooms/vacant`);
      console.log("getVacantRoomsList response:", response);
      if (response?.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error in getVacantRoomsList:", error);
      throw error;
    }
  },

  // Update a room
  updateRoom: async (
    buildingId: string,
    roomName: string,
    roomData: Partial<Room>
  ): Promise<Room> => {
    try {
      const updateData = {
        roomName: roomData.roomName,
        rentAmount: roomData.rentAmount,
        description: roomData.description,
        active: roomData.active,
      };

      const response = await api.put(
        `/buildings/${buildingId}/rooms/${roomName}`,
        updateData
      );
      console.log("updateRoom response:", response);
      if (response?.data) {
        return response.data;
      }
      throw new Error("Failed to update room");
    } catch (error) {
      console.error("Error in updateRoom:", error);
      throw error;
    }
  },

  // Delete a room
  deleteRoom: async (buildingId: string, roomName: string): Promise<string> => {
    try {
      await api.delete(`/buildings/${buildingId}/rooms/${roomName}`);
      // If we get here, the deletion was successful (204 NO_CONTENT)
      return "Room deleted successfully";
    } catch (error: any) {
      // If the error has a response with a message, use that
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      console.error("Error in deleteRoom:", error);
      throw error;
    }
  },

  // Get the base URL for debugging
  getBaseUrl: () => {
    return api.getBaseUrl();
  },
};

export default roomService;
