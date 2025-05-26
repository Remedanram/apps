import { Room, Transaction, DashboardData } from "../types/navigation";

// Mock user credentials
export const mockUsers = [
  {
    id: 1,
    username: "admin",
    password: "admin123", // In a real app, passwords would be hashed
    role: "admin",
  },
  {
    id: 2,
    username: "manager",
    password: "manager123",
    role: "manager",
  },
];

// Mock rooms data
export const mockRooms: Room[] = [
  {
    id: 1,
    number: "101",
    status: "occupied",
    tenant: "John Doe",
    rentAmount: 1200,
    lastPayment: "2024-03-01",
    dueDate: "2024-04-01",
  },
  {
    id: 2,
    number: "102",
    status: "vacant",
    tenant: null,
    rentAmount: 1100,
    lastPayment: null,
    dueDate: null,
  },
  {
    id: 3,
    number: "103",
    status: "occupied",
    tenant: "Jane Smith",
    rentAmount: 1300,
    lastPayment: "2024-03-05",
    dueDate: "2024-04-05",
  },
];

// Mock transactions data
export const mockTransactions: Transaction[] = [
  {
    id: 1,
    roomNumber: "101",
    tenant: "John Doe",
    amount: 1200,
    type: "PAYMENT",
    date: "2024-03-01",
    status: "completed",
  },
  {
    id: 2,
    roomNumber: "103",
    tenant: "Jane Smith",
    amount: 1300,
    type: "PAYMENT",
    date: "2024-03-05",
    status: "completed",
  },
  {
    id: 3,
    roomNumber: "101",
    tenant: "John Doe",
    amount: 1200,
    type: "CHARGE",
    date: "2024-04-01",
    status: "pending",
  },
];

// Mock monthly summary data
export const mockMonthlySummary = {
  currentMonth: {
    totalRevenue: 2500,
    paidRooms: 2,
    pendingRooms: 1,
    occupancyRate: 66.7,
  },
  previousMonths: [
    {
      month: "February",
      revenue: 2300,
      occupancyRate: 66.7,
    },
    {
      month: "January",
      revenue: 2100,
      occupancyRate: 33.3,
    },
  ],
};

// Mock status data
export const mockStatusData = {
  occupancyRate: 66.7,
  totalRooms: 3,
  occupiedRooms: 2,
  vacantRooms: 1,
  paymentStatus: {
    paid: 2,
    pending: 1,
    overdue: 0,
  },
  revenueBreakdown: {
    collected: 2500,
    pending: 1200,
    overdue: 0,
  },
};

// Mock trends data
export const mockTrendsData = {
  occupancyTrend: [
    { month: "Jan", rate: 33.3 },
    { month: "Feb", rate: 66.7 },
    { month: "Mar", rate: 66.7 },
  ],
  revenueTrend: [
    { month: "Jan", amount: 2100 },
    { month: "Feb", amount: 2300 },
    { month: "Mar", amount: 2500 },
  ],
};

// Mock dashboard data
export const mockDashboardData: DashboardData = {
  quickStats: {
    totalRooms: 3,
    occupiedRooms: 2,
    totalRevenue: 2500,
    pendingPayments: 1200,
  },
  occupancyRate: 66.7,
  roomStatus: {
    occupied: 2,
    vacant: 1,
    maintenance: 0,
  },
  recentTransactions: mockTransactions.slice(0, 2),
};

// Monthly rooms data
export const mockMonthlyRooms = {
  paid: [
    {
      id: 1,
      number: "101",
      tenant: "John Doe",
      amount: 1200,
      paymentDate: "2024-03-01",
      status: "paid",
    },
    {
      id: 3,
      number: "103",
      tenant: "Jane Smith",
      amount: 1300,
      paymentDate: "2024-03-05",
      status: "paid",
    },
  ],
  pending: [
    {
      id: 2,
      number: "102",
      tenant: "Mike Johnson",
      amount: 1100,
      dueDate: "2024-03-15",
      status: "pending",
    },
    {
      id: 4,
      number: "104",
      tenant: "Sarah Williams",
      amount: 1250,
      dueDate: "2024-03-20",
      status: "pending",
    },
  ],
};

// Monthly transactions by month
export const mockMonthlyTransactions = {
  "2024-03": [
    {
      id: 1,
      roomNumber: "101",
      tenant: "John Doe",
      amount: 1200,
      type: "PAYMENT",
      date: "2024-03-01",
      status: "completed",
    },
    {
      id: 2,
      roomNumber: "103",
      tenant: "Jane Smith",
      amount: 1300,
      type: "PAYMENT",
      date: "2024-03-05",
      status: "completed",
    },
  ],
  "2024-02": [
    {
      id: 3,
      roomNumber: "101",
      tenant: "John Doe",
      amount: 1200,
      type: "PAYMENT",
      date: "2024-02-01",
      status: "completed",
    },
    {
      id: 4,
      roomNumber: "102",
      tenant: "Mike Johnson",
      amount: 1100,
      type: "PAYMENT",
      date: "2024-02-03",
      status: "completed",
    },
  ],
  "2024-01": [
    {
      id: 5,
      roomNumber: "103",
      tenant: "Jane Smith",
      amount: 1300,
      type: "PAYMENT",
      date: "2024-01-05",
      status: "completed",
    },
    {
      id: 6,
      roomNumber: "104",
      tenant: "Sarah Williams",
      amount: 1250,
      type: "PAYMENT",
      date: "2024-01-10",
      status: "completed",
    },
  ],
};
