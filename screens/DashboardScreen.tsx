import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Text,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Card from "../components/Card";
import theme from "../constants/theme";
import { DashboardData, RootStackParamList } from "../types/navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import roomService from "../services/roomService";
import type { RoomStats } from "../types/room";
import tenantService from "../services/tenantService";
import transactionService from "../services/transactionService";
import type { Transaction } from "../services/transactionService";
import AddBuildingModal from "../components/AddBuildingModal";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useBuilding } from "../contexts/BuildingContext";

type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

const DashboardScreen: React.FC = () => {
  const { selectedBuilding } = useBuilding();
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
    recentTransactions: [],
  });
  const [isAddBuildingModalVisible, setIsAddBuildingModalVisible] =
    useState(false);
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { setSelectedBuilding } = useBuilding();

  const loadDashboardData = async () => {
    if (!selectedBuilding?.id) {
      console.log("No building selected");
      return;
    }

    try {
      setLoading(true);
      // Fetch room statistics
      const roomStats: RoomStats = await roomService.getTotalRooms(
        selectedBuilding.id
      );
      const tenantStats = await tenantService.getTotalTenants(
        selectedBuilding.id
      );
      const vacantRooms = await roomService.getVacantRooms(selectedBuilding.id);
      const occupiedRooms = await roomService.getOccupiedRooms(
        selectedBuilding.id
      );
      const recentTransactions = await transactionService.getRecentTransactions(
        selectedBuilding.id
      );

      // Update dashboard data with real data
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
        recentTransactions,
      }));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedBuilding?.id) {
      loadDashboardData();
    }
  }, [selectedBuilding?.id]);

  useFocusEffect(
    React.useCallback(() => {
      if (selectedBuilding?.id) {
        loadDashboardData();
      }
    }, [selectedBuilding?.id])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, []);

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

  const handleBuildingPress = () => {
    // @ts-ignore - BuildingSelection is a valid route in the root stack
    navigation.navigate("BuildingSelection");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBuildingPress}
          style={styles.buildingSelector}
        >
          <Text style={styles.buildingName}>
            {selectedBuilding?.name || "Select Building"}
          </Text>
          <Feather
            name="chevron-down"
            size={20}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddBuildingModalVisible(true)}
          >
            <Feather name="plus" size={20} color={theme.colors.primary} />
            <Text style={styles.addButtonText}>Add Building</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => Alert.alert("Coming soon")}
          >
            <Feather name="bell" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.success + "20" },
            ]}
            onPress={() => navigateToScreen("AddRoom")}
          >
            <Feather
              name="plus-square"
              size={24}
              color={theme.colors.success}
            />
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
          <Text style={styles.occupancyRate}>
            {dashboardData.occupancyRate.toFixed(1)}%
          </Text>
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
          {dashboardData.recentTransactions?.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View>
                <Text style={styles.transactionName}>
                  {transaction.senderName}
                </Text>
                <Text style={styles.transactionPhone}>
                  {transaction.senderPhone}
                </Text>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: theme.colors.success },
                  ]}
                >
                  +${transaction.amount.toFixed(2)}
                </Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.txnDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>

      <AddBuildingModal
        visible={isAddBuildingModalVisible}
        onClose={() => setIsAddBuildingModalVisible(false)}
        onBuildingAdded={() => {
          // Refresh the building list or handle the new building
          // @ts-ignore - BuildingSelection is a valid route in the root stack
          navigation.navigate("BuildingSelection");
        }}
      />
    </View>
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
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  buildingSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  buildingName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginRight: theme.spacing.xs,
  },
  notificationButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  addButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: "600",
    marginLeft: theme.spacing.xs,
  },
  content: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    fontSize: theme.typography.sizes.sm,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  statsButton: {
    flex: 1,
  },
  statsCard: {
    alignItems: "center",
    padding: theme.spacing.md,
  },
  statsValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "700",
    marginTop: theme.spacing.sm,
  },
  statsLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  occupancyCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  occupancyRate: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: "700",
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  roomStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  roomStatusItem: {
    alignItems: "center",
  },
  roomStatusValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "700",
  },
  roomStatusLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  transactionsCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewMoreText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: "600",
    marginRight: theme.spacing.xs,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  transactionName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
  },
  transactionPhone: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  transactionDescription: {
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
    marginTop: theme.spacing.xs,
    textAlign: "right",
  },
});

export default DashboardScreen;
