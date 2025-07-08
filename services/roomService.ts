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
        return response.data.map((room: any) => ({
          id: room.id,
          roomName: room.roomName,
          rentAmount: room.rentAmount,
          description: room.description,
          active: room.active,
          occupied: room.occupied, // use backend value directly
        }));
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
    roomId: string,
    roomData: {
      roomName: string;
      rentAmount: number;
      description: string;
      buildingId: string;
    }
  ): Promise<Room> => {
    try {
      const updateData = {
        roomName: roomData.roomName,
        rentAmount: roomData.rentAmount,
        description: roomData.description,
        buildingId: roomData.buildingId,
      };
      const response = await api.put(
        `/buildings/${buildingId}/rooms/${roomId}`,
        updateData
      );
      if (response?.data) {
        return response.data;
      }
      throw new Error("Failed to update room");
    } catch (error) {
      throw error;
    }
  },

  // Delete a room
  deleteRoom: async (buildingId: string, roomId: string): Promise<string> => {
    try {
      await api.delete(`/buildings/${buildingId}/rooms/${roomId}`);
      return "Room deleted successfully";
    } catch (error: any) {
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
