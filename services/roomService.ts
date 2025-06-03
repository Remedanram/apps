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
      if (response?.data) {
        return response.data;
      }
      throw new Error("Failed to create room");
    } catch (error: any) {
      // Get the error message from the response
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create room. Please try again.";

      // Check if it's a duplicate room error
      if (errorMessage.toLowerCase().includes("already exists")) {
        const roomName = errorMessage.match(/'([^']+)'/)?.[1] || "this name";
        throw new Error(
          `${roomName} already exists. Please choose a different room name.`
        );
      }

      // For any other error, throw with the original message
      throw new Error(errorMessage);
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
  updateRoom: async (
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

      const response = await api.put(`/rooms/${roomName}`, updateData);
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
  deleteRoom: async (roomName: string): Promise<string> => {
    try {
      await api.delete(`/rooms/${roomName}`);
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
