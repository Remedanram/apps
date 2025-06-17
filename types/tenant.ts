export enum TenantStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface Tenant {
  id: number;
  name: string;
  phone: string;
  email: string;
  moveInDate: string;
  moveOutDate: string | null;
  status: TenantStatus;
  description: string;
  room: {
    roomName: string;
    rentAmount: number;
    description: string;
    active: boolean;
    occupied: boolean;
  };
}

export interface CreateTenantRequest {
  name: string;
  phone: string;
  email: string;
  description: string;
  moveInDate?: string;
}
