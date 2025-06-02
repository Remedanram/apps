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
  // Get all rooms
  getAllRooms: async (): Promise<Room[]> => {
    try {
      const response = await api.get("/rooms");
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

  // Get room counts
  getRoomCounts: async (): Promise<RoomCount> => {
    try {
      const response = await api.get("/rooms/count");
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

  // Get vacant rooms
  getVacantRooms: async (): Promise<number> => {
    try {
      const counts = await roomService.getRoomCounts();
      return counts.vacantCount;
    } catch (error) {
      console.error("Error in getVacantRooms:", error);
      throw error;
    }
  },

  // Get occupied rooms
  getOccupiedRooms: async (): Promise<number> => {
    try {
      const counts = await roomService.getRoomCounts();
      return counts.occupiedCount;
    } catch (error) {
      console.error("Error in getOccupiedRooms:", error);
      throw error;
    }
  },

  // Create a new room
  createRoom: async (roomData: CreateRoomRequest): Promise<Room> => {
    try {
      const response = await api.post("/rooms", roomData);
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

  // Get total number of rooms
  getTotalRooms: async (): Promise<RoomStats> => {
    try {
      const counts = await roomService.getRoomCounts();
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

  // Get vacant rooms list
  getVacantRoomsList: async (): Promise<Room[]> => {
    try {
      const response = await api.get("/rooms/vacant");
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
  updateRoom: async (id: number, roomData: Partial<Room>): Promise<Room> => {
    try {
      if (!roomData.roomName) {
        throw new Error("Room name is required for update");
      }
      const response = await api.put(`/rooms/${roomData.roomName}`, roomData);
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
  deleteRoom: async (roomName: string): Promise<void> => {
    try {
      const response = await api.delete(`/rooms/${roomName}`);
      console.log("deleteRoom response:", response);
      if (!response?.data) {
        throw new Error("Failed to delete room");
      }
    } catch (error) {
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
