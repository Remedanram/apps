export interface Room {
  id?: number;
  roomName: string;
  rentAmount: number;
  description?: string;
  active: boolean;
  occupied: boolean;
}

export interface RoomResponse {
  success: boolean;
  data: Room[];
  message?: string;
}

export interface RoomStats {
  totalRooms: number;
  activeRooms: number;
  inactiveRooms: number;
}

export interface CreateRoomRequest {
  roomName: string;
  rentAmount: number;
  description?: string;
  buildingId: string;
}
