import type { Room } from "./room";

export enum TenantStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface Tenant {
  id: number;
  tenantCode?: string;
  name: string;
  phone: string;
  email: string;
  moveInDate: string;
  moveOutDate: string | null;
  status: TenantStatus;
  description: string;
  room: Room;
}

export interface CreateTenantRequest {
  name: string;
  phone: string;
  email: string;
  description: string;
  moveInDate?: string;
}
