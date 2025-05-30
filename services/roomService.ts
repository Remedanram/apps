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

const roomService = {
  // Get all rooms
  getAllRooms: async (): Promise<Room[]> => {
    try {
      const response = await api.get("/rooms");
      console.log("getAllRooms response:", response);
      if (response?.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error in getAllRooms:", error);
      throw error;
    }
  },

  // Get vacant rooms
  getVacantRooms: async (): Promise<number> => {
    try {
      const response = await api.get("/rooms/vacantRooms");
      console.log("getVacantRooms response:", response);
      if (response?.data) {
        return response.data;
      }
      return 0;
    } catch (error) {
      console.error("Error in getVacantRooms:", error);
      throw error;
    }
  },

  // Get occupied rooms
  getOccupiedRooms: async (): Promise<number> => {
    try {
      const response = await api.get("/rooms/occupiedRooms");
      console.log("getOccupiedRooms response:", response);
      if (response?.data) {
        return response.data;
      }
      return 0;
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
      const response = await api.get("/rooms/totalRooms");
      console.log("getTotalRooms response:", response);
      if (response?.data) {
        // Convert the number response to RoomStats format
        return {
          totalRooms: response.data,
          activeRooms: response.data, // Since we don't have this info, using total as active
          inactiveRooms: 0, // Since we don't have this info, defaulting to 0
        };
      }
      throw new Error("Failed to get room stats");
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
