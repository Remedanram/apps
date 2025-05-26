import React, { useState } from "react";
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
import {
  mockMonthlySummary,
  mockMonthlyTransactions,
} from "../services/mockData";
import theme from "../constants/theme";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MonthlyStackParamList } from "../navigation/AppNavigator";
import { Transaction } from "../types/navigation";

type Props = {
  navigation: NativeStackNavigationProp<MonthlyStackParamList, "MonthlyHome">;
};

type MonthlyTransactions = {
  [key: string]: Transaction[];
};

const MonthlyScreen: React.FC<Props> = ({ navigation }) => {
  const [data, setData] = useState(mockMonthlySummary);
  const [refreshing, setRefreshing] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("2024-03");

  const months = Object.keys(mockMonthlyTransactions).sort((a, b) =>
    b.localeCompare(a)
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setData(mockMonthlySummary);
    setRefreshing(false);
  };

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    setShowMonthPicker(false);
    navigation.navigate("MonthlyDetails", { month });
  };

  const formatOccupancyRate = (rate: number) => {
    return rate.toFixed(1);
  };

  const transactions =
    (mockMonthlyTransactions as MonthlyTransactions)[selectedMonth] || [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Month Selector */}
      <TouchableOpacity
        style={styles.monthSelector}
        onPress={() => setShowMonthPicker(true)}
      >
        <Text style={styles.monthText}>
          {format(new Date(selectedMonth), "MMMM yyyy")}
        </Text>
        <Feather name="calendar" size={24} color={theme.colors.primary} />
      </TouchableOpacity>

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
            <Text style={styles.statValue}>
              ${data.currentMonth.totalRevenue}
            </Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>

          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate("PaidRooms")}
          >
            <Feather
              name="check-circle"
              size={24}
              color={theme.colors.success}
            />
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {data.currentMonth.paidRooms}
            </Text>
            <Text style={styles.statLabel}>Paid Rooms</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate("PendingRooms")}
          >
            <Feather name="clock" size={24} color={theme.colors.warning} />
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>
              {data.currentMonth.pendingRooms}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </TouchableOpacity>

          <View style={styles.statItem}>
            <Feather name="percent" size={24} color={theme.colors.info} />
            <Text style={styles.statValue}>
              {formatOccupancyRate(data.currentMonth.occupancyRate)}%
            </Text>
            <Text style={styles.statLabel}>Occupancy</Text>
          </View>
        </View>
      </Card>

      {/* Monthly Transactions */}
      <Card style={styles.transactionsCard}>
        <Text style={styles.cardTitle}>Monthly Transactions</Text>
        {transactions.map((transaction) => (
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
                    selectedMonth === item && styles.selectedMonthItem,
                  ]}
                  onPress={() => handleMonthSelect(item)}
                >
                  <Text
                    style={[
                      styles.monthItemText,
                      selectedMonth === item && styles.selectedMonthItemText,
                    ]}
                  >
                    {format(new Date(item), "MMMM yyyy")}
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
  monthSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  monthText: {
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
});

export default MonthlyScreen;
