import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import Card from "../components/Card";
import theme from "../constants/theme";
import { DashboardData, RootStackParamList } from "../types/navigation";
import { mockDashboardData } from "../services/mockData";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import roomService from "../services/roomService";
import type { RoomStats } from "../types/room";
import tenantService from "../services/tenantService";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Dashboard">;
};

const mockTransactions = [
  {
    id: 1,
    roomNumber: "101",
    tenant: "John Doe",
    amount: 500,
    type: "PAYMENT" as const,
    date: new Date().toISOString(),
    status: "completed" as const,
  },
  {
    id: 2,
    roomNumber: "102",
    tenant: "Jane Smith",
    amount: 450,
    type: "PAYMENT" as const,
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    status: "completed" as const,
  },
  {
    id: 3,
    roomNumber: "103",
    tenant: "Mike Johnson",
    amount: 550,
    type: "PAYMENT" as const,
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    status: "completed" as const,
  },
  {
    id: 4,
    roomNumber: "104",
    tenant: "Sarah Williams",
    amount: 480,
    type: "PAYMENT" as const,
    date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    status: "completed" as const,
  },
];

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    quickStats: {
      totalRooms: 0,
      occupiedRooms: 0,
      totalRevenue: 0,
      pendingPayments: 0,
      totalTenants: 0,
    },
    occupancyRate: 0,
    roomStatus: {
      occupied: 0,
      vacant: 0,
      maintenance: 0,
    },
    recentTransactions: mockTransactions,
  });
  const [totalRooms, setTotalRooms] = useState(0);
  const [totalTenants, setTotalTenants] = useState(0);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch room statistics
      const roomStats: RoomStats = await roomService.getTotalRooms();
      const tenantStats = await tenantService.getTotalTenants();
      const vacantRooms = await roomService.getVacantRooms();
      const occupiedRooms = await roomService.getOccupiedRooms();

      // Update dashboard data with real room stats
      setDashboardData((prev) => ({
        ...prev,
        quickStats: {
          ...prev.quickStats,
          totalRooms: roomStats.totalRooms,
          occupiedRooms: occupiedRooms,
          totalTenants: tenantStats.totalTenants,
        },
        roomStatus: {
          occupied: occupiedRooms,
          vacant: vacantRooms,
          maintenance: 0,
        },
        occupancyRate: (occupiedRooms / roomStats.totalRooms) * 100 || 0,
      }));
      setTotalRooms(roomStats.totalRooms);
      setTotalTenants(tenantStats.totalTenants);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  const navigateToScreen = (screen: keyof RootStackParamList) => {
    switch (screen) {
      case "TransactionsList":
        navigation.navigate("TransactionsList", { status: "" });
        break;
      case "RoomList":
        navigation.navigate("RoomList");
        break;
      case "TenantList":
        navigation.navigate("TenantList");
        break;
      case "AddRoom":
        navigation.navigate("AddRoom");
        break;
      case "AddTenant":
        navigation.navigate("AddTenant");
        break;
    }
  };

  const occupancyRate = totalRooms > 0 ? (totalTenants / totalRooms) * 100 : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.buildingName}>Remedan Building</Text>
          <Text style={styles.subtitle}>Dashboard Overview</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>2</Text>
          </View>
          <Feather name="bell" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.success + "20" },
          ]}
          onPress={() => navigateToScreen("AddRoom")}
        >
          <Feather name="plus-square" size={24} color={theme.colors.success} />
          <Text style={styles.actionButtonText}>Add Room</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.info + "20" },
          ]}
          onPress={() => navigateToScreen("AddTenant")}
        >
          <Feather name="user-plus" size={24} color={theme.colors.info} />
          <Text style={styles.actionButtonText}>Add Tenant</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => navigateToScreen("RoomList")}
        >
          <Card style={styles.statsCard}>
            <Feather name="home" size={24} color={theme.colors.primary} />
            <Text style={styles.statsValue}>
              {dashboardData.quickStats.totalRooms}
            </Text>
            <Text style={styles.statsLabel}>Total Rooms</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => navigateToScreen("TenantList")}
        >
          <Card style={styles.statsCard}>
            <Feather name="users" size={24} color={theme.colors.secondary} />
            <Text style={styles.statsValue}>
              {dashboardData.quickStats.totalTenants}
            </Text>
            <Text style={styles.statsLabel}>Total Tenants</Text>
          </Card>
        </TouchableOpacity>
      </View>

      {/* Occupancy Card */}
      <Card style={styles.occupancyCard}>
        <Text style={styles.cardTitle}>Occupancy Rate</Text>
        <Text style={styles.occupancyRate}>{occupancyRate.toFixed(1)}%</Text>
        <View style={styles.roomStatusContainer}>
          <View style={styles.roomStatusItem}>
            <Text style={styles.roomStatusValue}>
              {dashboardData.roomStatus.occupied}
            </Text>
            <Text style={styles.roomStatusLabel}>Occupied</Text>
          </View>
          <View style={styles.roomStatusItem}>
            <Text style={styles.roomStatusValue}>
              {dashboardData.roomStatus.vacant}
            </Text>
            <Text style={styles.roomStatusLabel}>Vacant</Text>
          </View>
          <View style={styles.roomStatusItem}>
            <Text style={styles.roomStatusValue}>
              {dashboardData.roomStatus.maintenance}
            </Text>
            <Text style={styles.roomStatusLabel}>Maintenance</Text>
          </View>
        </View>
      </Card>

      {/* Recent Transactions */}
      <Card style={styles.transactionsCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Transactions</Text>
          <TouchableOpacity
            onPress={() => navigateToScreen("TransactionsList")}
            style={styles.viewMoreButton}
          >
            <Text style={styles.viewMoreText}>View More</Text>
            <Feather
              name="chevron-right"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
        {dashboardData.recentTransactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View>
              <Text style={styles.transactionRoom}>
                Room {transaction.roomNumber}
              </Text>
              <Text style={styles.transactionTenant}>{transaction.tenant}</Text>
            </View>
            <View>
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color:
                      transaction.type === "PAYMENT"
                        ? theme.colors.success
                        : theme.colors.error,
                  },
                ]}
              >
                {transaction.type === "PAYMENT" ? "+" : "-"}$
                {transaction.amount}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  buildingName: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "700",
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  notificationButton: {
    padding: theme.spacing.sm,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  notificationCount: {
    color: "white",
    fontSize: theme.typography.sizes.xs,
    fontWeight: "700",
  },
  actionButtons: {
    flexDirection: "row",
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  actionButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
    color: theme.colors.text.primary,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing.md,
    paddingTop: 0,
    gap: theme.spacing.md,
  },
  statsButton: {
    width: "48%",
  },
  statsCard: {
    padding: theme.spacing.md,
    alignItems: "center",
  },
  statsValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "700",
    marginVertical: theme.spacing.sm,
  },
  statsLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  occupancyCard: {
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
  },
  occupancyRate: {
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: "700",
    color: theme.colors.primary,
    textAlign: "center",
    marginVertical: theme.spacing.md,
  },
  roomStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  roomStatusItem: {
    alignItems: "center",
  },
  roomStatusValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
  },
  roomStatusLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  transactionsCard: {
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewMoreText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.sm,
    marginRight: theme.spacing.xs,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  transactionRoom: {
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
  },
  transactionTenant: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  transactionAmount: {
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
    textAlign: "right",
  },
  transactionDate: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    textAlign: "right",
    marginTop: theme.spacing.xs,
  },
});

export default DashboardScreen;
