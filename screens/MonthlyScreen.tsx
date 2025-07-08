import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  TextInput,
  Button,
  ActivityIndicator,
} from "react-native";
import Card from "../components/Card";
import theme from "../constants/theme";
import { Feather } from "@expo/vector-icons";
import { format, getYear } from "date-fns";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import matchService, { MatchRoom } from "../services/matchService";
import { useBuilding } from "../contexts/BuildingContext";
import tenantService, { DueAmountDetails } from "../services/tenantService";
import buildingService from "../services/buildingService";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Monthly">;
};

const MonthlyScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedBuilding } = useBuilding();
  const [refreshing, setRefreshing] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [paidCount, setPaidCount] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [paidRooms, setPaidRooms] = useState<MatchRoom[]>([]);
  const [unpaidRooms, setUnpaidRooms] = useState<MatchRoom[]>([]);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDueModalVisible, setIsDueModalVisible] = useState(false);
  const [tenantCode, setTenantCode] = useState("");
  const [dueDetails, setDueDetails] = useState<DueAmountDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedBuilding?.id) {
      setLoading(false);
      loadYears();
    } else {
      setLoading(true);
    }
  }, [selectedBuilding]);

  const loadYears = async () => {
    if (!selectedBuilding?.id) return;
    try {
      const years = await buildingService.getAvailableYears(
        selectedBuilding.id
      );
      setAvailableYears(Array.isArray(years) ? years : []);
    } catch (error) {
      console.error("Error loading years:", error);
      setAvailableYears([]);
    }
  };

  const loadData = async () => {
    if (!selectedBuilding?.id) return;
    try {
      const period = format(selectedDate, "yyyy-MM");

      const [paid, unpaid, paidCountData, unpaidCountData, revenue] =
        await Promise.all([
          matchService.getPaidRooms(selectedBuilding.id, period),
          matchService.getUnpaidRooms(selectedBuilding.id, period),
          matchService.getPaidCount(selectedBuilding.id, period),
          matchService.getUnpaidCount(selectedBuilding.id, period),
          matchService.getTotalRevenue(selectedBuilding.id, period),
        ]);

      setPaidRooms(Array.isArray(paid) ? paid : []);
      setUnpaidRooms(Array.isArray(unpaid) ? unpaid : []);
      setPaidCount(typeof paidCountData === "number" ? paidCountData : 0);
      setUnpaidCount(typeof unpaidCountData === "number" ? unpaidCountData : 0);
      setTotalRevenue(typeof revenue === "number" ? revenue : 0);
    } catch (error) {
      console.error("Error loading monthly data:", error);
      setPaidRooms([]);
      setUnpaidRooms([]);
      setPaidCount(0);
      setUnpaidCount(0);
      setTotalRevenue(0);
    }
  };

  useEffect(() => {
    if (selectedBuilding?.id) {
      loadData();
    }
  }, [selectedDate, selectedBuilding]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), loadYears()]);
    setRefreshing(false);
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Filter months based on building creation date
  let filteredMonths = months;
  if (selectedBuilding?.createdAt) {
    const createdDate = new Date(selectedBuilding.createdAt);
    const creationYear = createdDate.getFullYear();
    const creationMonth = createdDate.getMonth(); // 0-based
    const selectedYear = selectedDate.getFullYear();
    if (selectedYear === creationYear) {
      filteredMonths = months.slice(creationMonth);
    }
  }

  const handleMonthSelect = (month: string) => {
    const newDate = new Date(selectedDate);
    let monthIndex = months.indexOf(month);
    if (selectedBuilding?.createdAt) {
      const createdDate = new Date(selectedBuilding.createdAt);
      const creationYear = createdDate.getFullYear();
      const creationMonth = createdDate.getMonth();
      const selectedYear = selectedDate.getFullYear();
      if (selectedYear === creationYear) {
        monthIndex = creationMonth + filteredMonths.indexOf(month);
      }
    }
    newDate.setMonth(monthIndex);
    setSelectedDate(newDate);
    setShowMonthPicker(false);
    navigation.navigate("MonthlyDetails", {
      period: format(newDate, "yyyy-MM"),
    });
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(year);
    setSelectedDate(newDate);
    setShowYearPicker(false);
  };

  const calculateOccupancyRate = () => {
    const totalRooms = paidCount + unpaidCount;
    return totalRooms > 0 ? (paidCount / totalRooms) * 100 : 0;
  };

  const handleGetDueAmount = async () => {
    if (!tenantCode) {
      Alert.alert("Validation Error", "Please enter a Tenant Code.");
      return;
    }
    setLoading(true);
    setError(null);
    setDueDetails(null);
    try {
      const data = await tenantService.getTenantDue(tenantCode);
      setDueDetails(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch due amount. Please check the tenant code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsDueModalVisible(false);
    setTenantCode("");
    setDueDetails(null);
    setError(null);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.dueButton}
          onPress={() => setIsDueModalVisible(true)}
        >
          <Text style={styles.dueButtonText}>Get Due Amount</Text>
        </TouchableOpacity>
      </View>

      {/* Building Selection Check */}
      {!selectedBuilding?.id ? (
        <View style={styles.fullScreenMessage}>
          <Text style={styles.noDataText}>
            Please select a building from the building selection screen to view
            monthly data.
          </Text>
          <TouchableOpacity
            style={styles.selectBuildingButton}
            onPress={() => navigation.navigate("BuildingSelection")}
          >
            <Text style={styles.selectBuildingButtonText}>Select Building</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Month and Year Selector */}
          <View style={styles.dateSelectorContainer}>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowMonthPicker(true)}
            >
              <Text style={styles.dateText}>
                {format(selectedDate, "MMMM")}
              </Text>
              <Feather name="calendar" size={24} color={theme.colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowYearPicker(true)}
            >
              <Text style={styles.dateText}>
                {format(selectedDate, "yyyy")}
              </Text>
              <Feather name="calendar" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Summary Card */}
          <Card style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Monthly Summary</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Feather
                  name="dollar-sign"
                  size={24}
                  color={theme.colors.success}
                />
                <Text style={styles.statValue}>${totalRevenue}</Text>
                <Text style={styles.statLabel}>Total Revenue</Text>
              </View>

              <TouchableOpacity
                style={styles.statItem}
                onPress={() =>
                  navigation.navigate("PaidRooms", {
                    period: format(selectedDate, "yyyy-MM"),
                  })
                }
              >
                <Feather
                  name="check-circle"
                  size={24}
                  color={theme.colors.success}
                />
                <Text
                  style={[styles.statValue, { color: theme.colors.success }]}
                >
                  {paidCount}
                </Text>
                <Text style={styles.statLabel}>Paid Rooms</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statItem}
                onPress={() =>
                  navigation.navigate("PendingRooms", {
                    period: format(selectedDate, "yyyy-MM"),
                  })
                }
              >
                <Feather name="clock" size={24} color={theme.colors.warning} />
                <Text
                  style={[styles.statValue, { color: theme.colors.warning }]}
                >
                  {unpaidCount}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </TouchableOpacity>

              <View style={styles.statItem}>
                <Feather name="percent" size={24} color={theme.colors.info} />
                <Text style={styles.statValue}>
                  {calculateOccupancyRate().toFixed(1)}%
                </Text>
                <Text style={styles.statLabel}>Occupancy</Text>
              </View>
            </View>
          </Card>

          {/* Monthly Transactions */}
          <Card style={styles.transactionsCard}>
            <Text style={styles.cardTitle}>Monthly Transactions</Text>
            {paidRooms.length > 0 ? (
              paidRooms.map((room) => (
                <View key={room.roomName} style={styles.transactionItem}>
                  <View>
                    <Text style={styles.transactionRoom}>{room.roomName}</Text>
                    <Text style={styles.transactionTenant}>
                      {room.tenantName}
                    </Text>
                    {room.paymentMethod && (
                      <View style={styles.paymentMethodBadge}>
                        <Text style={styles.paymentMethodText}>
                          {room.paymentMethod.replace(/_/g, " ")}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.transactionAmount,
                        { color: theme.colors.success },
                      ]}
                    >
                      +${room.amount}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {room.day
                        ? new Date(room.day).toLocaleDateString()
                        : "Date not set"}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>
                No transactions for this month
              </Text>
            )}
          </Card>
        </>
      )}

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Month</Text>
            <FlatList
              data={filteredMonths}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.monthItem,
                    format(selectedDate, "MMMM") === item &&
                      styles.selectedMonthItem,
                  ]}
                  onPress={() => handleMonthSelect(item)}
                >
                  <Text
                    style={[
                      styles.monthItemText,
                      format(selectedDate, "MMMM") === item &&
                        styles.selectedMonthItemText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowYearPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Year</Text>
            <FlatList
              data={availableYears}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.monthItem,
                    getYear(selectedDate) === item && styles.selectedMonthItem,
                  ]}
                  onPress={() => handleYearSelect(item)}
                >
                  <Text
                    style={[
                      styles.monthItemText,
                      getYear(selectedDate) === item &&
                        styles.selectedMonthItemText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isDueModalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Get Due Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Tenant Code"
              value={tenantCode}
              onChangeText={setTenantCode}
              autoCapitalize="characters"
            />
            <Button
              title="Get Details"
              onPress={handleGetDueAmount}
              disabled={loading}
            />

            {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

            {error && <Text style={styles.errorText}>{error}</Text>}

            {dueDetails && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailText}>
                  Name: {dueDetails.tenantName}
                </Text>
                <Text style={styles.detailText}>
                  Room: {dueDetails.roomName}
                </Text>
                <Text style={styles.detailText}>
                  Billing Month: {dueDetails.billingMonth}
                </Text>
                <Text style={styles.amountDue}>
                  Amount Due: ${Number(dueDetails.amountDue || 0).toFixed(2)}
                </Text>
                <Text style={styles.detailText}>
                  Next Billing Date:{" "}
                  {new Date(dueDetails.nextBillingStart).toLocaleDateString()}
                </Text>
              </View>
            )}

            <View style={{ marginTop: 20 }}>
              <Button
                title="Close"
                onPress={handleModalClose}
                color={theme.colors.danger}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  headerActions: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: "flex-end",
    marginHorizontal: -theme.spacing.md, // counteract parent padding
    marginTop: -theme.spacing.sm,
  },
  dueButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
  },
  dueButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: theme.typography.sizes.sm,
  },
  fullScreenMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  dateSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  dateSelector: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
  },
  dateText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    color: theme.colors.text.primary,
  },
  summaryCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  statValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "700",
    marginVertical: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  transactionsCard: {
    padding: theme.spacing.md,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
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
  statusText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    fontStyle: "italic",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    width: "80%",
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  monthItem: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  selectedMonthItem: {
    backgroundColor: theme.colors.primary + "20",
  },
  monthItemText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  selectedMonthItemText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  noDataText: {
    textAlign: "center",
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.md,
    padding: theme.spacing.md,
  },
  selectBuildingButton: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  selectBuildingButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
    color: theme.colors.background,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    fontSize: theme.typography.sizes.md,
  },
  errorText: {
    color: theme.colors.danger,
    marginTop: theme.spacing.md,
    textAlign: "center",
  },
  detailsContainer: {
    marginTop: theme.spacing.lg,
    width: "100%",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  detailText: {
    fontSize: theme.typography.sizes.md,
    marginBottom: theme.spacing.sm,
  },
  amountDue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginVertical: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  paymentMethodBadge: {
    backgroundColor: theme.colors.info,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  paymentMethodText: {
    color: theme.colors.card,
    fontWeight: "bold",
    fontSize: theme.typography.sizes.sm,
  },
});

export default MonthlyScreen;
