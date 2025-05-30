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
} from "react-native";
import Card from "../components/Card";
import theme from "../constants/theme";
import { Feather } from "@expo/vector-icons";
import { format, getYear } from "date-fns";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MonthlyStackParamList } from "../navigation/AppNavigator";
import matchService, { MatchRoom } from "../services/matchService";

type Props = {
  navigation: NativeStackNavigationProp<MonthlyStackParamList, "MonthlyHome">;
};

const MonthlyScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [paidCount, setPaidCount] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [paidRooms, setPaidRooms] = useState<MatchRoom[]>([]);
  const [unpaidRooms, setUnpaidRooms] = useState<MatchRoom[]>([]);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    loadYears();
  }, []);

  const loadYears = async () => {
    try {
      const years = await matchService.getAvailableYears();
      setAvailableYears(Array.isArray(years) ? years : []);
    } catch (error) {
      console.error("Error loading years:", error);
      setAvailableYears([]);
    }
  };

  const loadData = async () => {
    try {
      const period = format(selectedDate, "yyyy-MM");

      const [paid, unpaid, paidCountData, unpaidCountData] = await Promise.all([
        matchService.getPaidRooms(period),
        matchService.getUnpaidRooms(period),
        matchService.getPaidCount(period),
        matchService.getUnpaidCount(period),
      ]);

      setPaidRooms(Array.isArray(paid) ? paid : []);
      setUnpaidRooms(Array.isArray(unpaid) ? unpaid : []);
      setPaidCount(typeof paidCountData === "number" ? paidCountData : 0);
      setUnpaidCount(typeof unpaidCountData === "number" ? unpaidCountData : 0);
    } catch (error) {
      console.error("Error loading monthly data:", error);
      setPaidRooms([]);
      setUnpaidRooms([]);
      setPaidCount(0);
      setUnpaidCount(0);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), loadYears()]);
    setRefreshing(false);
  };

  const handleMonthSelect = (month: string) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(months.indexOf(month));
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

  const calculateTotalRevenue = () => {
    return paidRooms.reduce((sum, room) => sum + room.amount, 0);
  };

  const calculateOccupancyRate = () => {
    const totalRooms = paidCount + unpaidCount;
    return totalRooms > 0 ? (paidCount / totalRooms) * 100 : 0;
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Month and Year Selector */}
      <View style={styles.dateSelectorContainer}>
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowMonthPicker(true)}
        >
          <Text style={styles.dateText}>{format(selectedDate, "MMMM")}</Text>
          <Feather name="calendar" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowYearPicker(true)}
        >
          <Text style={styles.dateText}>{format(selectedDate, "yyyy")}</Text>
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
            <Text style={styles.statValue}>${calculateTotalRevenue()}</Text>
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
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
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
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>
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
                <Text style={styles.transactionTenant}>{room.tenantName}</Text>
                <Text style={styles.statusText}>
                  Status: {room.status.replace(/_/g, " ")}
                </Text>
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
                  {new Date(room.day).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No transactions for this month</Text>
        )}
      </Card>

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
              data={months}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
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
});

export default MonthlyScreen;
