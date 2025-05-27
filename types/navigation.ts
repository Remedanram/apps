import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Room } from "./room";
import { Tenant } from "../services/tenantService";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  TenantLedger: { phoneNumber: string };
  TransactionsList: { status: string };
  RoomList: undefined;
  TenantList: undefined;
  AddRoom: undefined;
  AddTenant: undefined;
  EditRoom: { room: Room };
  EditTenant: { tenant: Tenant };
  Dashboard: undefined;
  PaidRooms: undefined;
  PendingRooms: undefined;
  MonthlyDetails: { month: string };
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface Transaction {
  id: number;
  bankTxnId: string;
  txnDate: string;
  amount: number;
  senderName: string;
  senderPhone: string;
  description: string;
  importedAt: string;
}

export interface DashboardData {
  quickStats: {
    totalRooms: number;
    occupiedRooms: number;
    totalRevenue: number;
    pendingPayments: number;
    totalTenants: number;
  };
  occupancyRate: number;
  roomStatus: {
    occupied: number;
    vacant: number;
    maintenance: number;
  };
  recentTransactions?: Transaction[];
}
