import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  FlatList,
  Linking,
} from "react-native";
import { Text } from "react-native";
import Card from "../components/Card";
import theme from "../constants/theme";
import { Feather } from "@expo/vector-icons";
import roomService from "../services/roomService";
import api from "../services/api";
import type { RoomStats } from "../types/room";
import matchService from "../services/matchService";

// Define the type for the payment status data based on the API response
interface MonthStatus {
  month: string;
  status: "PAID" | "PENDING";
}

interface RoomPaymentStatus {
  roomName: string;
  tenantName: string;
  months: MonthStatus[];
}

const StatusScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentStatusData, setPaymentStatusData] = useState<
    RoomPaymentStatus[]
  >([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [showYearPicker, setShowYearPicker] = useState(false);

  useEffect(() => {
    fetchAvailableYears();
  }, []);

  useEffect(() => {
    fetchPaymentStatus(selectedYear);
  }, [selectedYear]);

  const fetchAvailableYears = async () => {
    try {
      const years = await matchService.getAvailableYears();
      setAvailableYears(Array.isArray(years) ? years : []);
      if (Array.isArray(years) && years.length > 0) {
        setSelectedYear(years[years.length - 1]);
      }
    } catch (error) {
      console.error("Error fetching available years:", error);
    }
  };

  const fetchPaymentStatus = async (year: number) => {
    setLoadingData(true);
    setError(null);
    try {
      const response = await api.get(`/matches/payment-status?year=${year}`);
      if (response.data) {
        setPaymentStatusData(response.data as RoomPaymentStatus[]);
      } else {
        setPaymentStatusData([]);
      }
    } catch (error) {
      console.error("Error fetching payment status:", error);
      setError("Failed to load payment status.");
      setPaymentStatusData([]);
      Alert.alert(
        "Error",
        "Failed to load payment status. Please try again later."
      );
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    fetchPaymentStatus(selectedYear);
  };

  // Handle export button press with confirmation
  const handleExport = async () => {
    // Show confirmation alert
    Alert.alert(
      "Confirm Export",
      "Are you sure you want to export the payment status data for the selected year?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            const exportUrl = `${api.getBaseUrl()}/matches/payment-status/export?year=${selectedYear}&format=excel`;
            try {
              const supported = await Linking.canOpenURL(exportUrl);
              if (supported) {
                await Linking.openURL(exportUrl);
              } else {
                Alert.alert(
                  "Error",
                  `Don't know how to open this URL: ${exportUrl}`
                );
              }
            } catch (error) {
              console.error("Error opening export URL:", error);
              Alert.alert("Export Failed", "Could not open the export file.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderStatusCell = (status: "PAID" | "PENDING") => (
    <View
      style={[
        styles.statusIndicator,
        {
          backgroundColor:
            status === "PAID"
              ? theme.colors.success + "20"
              : theme.colors.warning + "20",
        },
      ]}
    >
      <Feather
        name={status === "PAID" ? "check-circle" : "clock"}
        size={16}
        color={status === "PAID" ? theme.colors.success : theme.colors.warning}
      />
    </View>
  );

  const renderStickyRoomColumn = () => (
    <View style={styles.stickyColumn}>
      <View style={[styles.tableHeader, styles.stickyHeader]}>
        <Text style={styles.headerText}>Room</Text>
      </View>
      {paymentStatusData.map((room) => (
        <View key={room.roomName} style={[styles.tableRow, styles.stickyRow]}>
          <Text style={styles.roomName}>{room.roomName}</Text>
          <Text style={styles.tenantName}>{room.tenantName}</Text>
        </View>
      ))}
    </View>
  );

  const renderScrollableContent = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollableContent}
    >
      <View>
        <View style={styles.tableHeader}>
          {[
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ].map((month) => (
            <View key={month} style={styles.headerCell}>
              <Text style={styles.headerText}>{month}</Text>
            </View>
          ))}
        </View>
        {paymentStatusData.map((room) => (
          <View key={room.roomName} style={styles.tableRow}>
            {[
              "JAN",
              "FEB",
              "MAR",
              "APR",
              "MAY",
              "JUN",
              "JUL",
              "AUG",
              "SEP",
              "OCT",
              "NOV",
              "DEC",
            ].map((monthAbbr) => {
              const monthData = room.months.find((m) => m.month === monthAbbr);
              const status = monthData ? monthData.status : "PENDING";
              return (
                <View key={monthAbbr} style={styles.cell}>
                  {renderStatusCell(status)}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.tableCard}>
        <View style={styles.tableHeaderContainer}>
          <Text style={styles.cardTitle}>Payment Status</Text>
          <View style={styles.tableHeaderButtons}>
            <TouchableOpacity
              style={styles.yearButton}
              onPress={() => setShowYearPicker(true)}
            >
              <Text style={styles.yearButtonText}>{selectedYear} ▼</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={handleExport}
            >
              <Text style={styles.exportButtonText}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>
        {loadingData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading payment status...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : paymentStatusData.length === 0 && !loadingData ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              No payment status data available for {selectedYear}.
            </Text>
          </View>
        ) : (
          <View style={styles.tableWrapper}>
            {renderStickyRoomColumn()}
            {renderScrollableContent()}
          </View>
        )}
      </Card>
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
                    selectedYear === item && styles.selectedMonthItem,
                  ]}
                  onPress={() => {
                    setSelectedYear(item);
                    setShowYearPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.monthItemText,
                      selectedYear === item && styles.selectedMonthItemText,
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
  cardTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
  },
  tableCard: {
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  tableHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  tableHeaderButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  yearButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
  },
  yearButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
  },
  exportButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  exportButtonText: {
    color: theme.colors.card,
    fontSize: theme.typography.sizes.sm,
    fontWeight: "bold",
  },
  tableWrapper: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.card,
  },
  stickyColumn: {
    backgroundColor: theme.colors.card,
    zIndex: 1,
    width: 150,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  stickyHeader: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    alignItems: "flex-start",
    justifyContent: "center",
    height: 40,
  },
  stickyRow: {
    flexDirection: "column",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    justifyContent: "center",
    height: 52,
  },
  scrollableContent: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: theme.colors.card,
    height: 40,
  },
  headerCell: {
    padding: theme.spacing.sm,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tableRow: {
    flexDirection: "row",
    height: 52,
  },
  cell: {
    padding: theme.spacing.sm,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: "600",
    color: theme.colors.text.secondary,
  },
  roomName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
  },
  tenantName: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.error + "10",
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.sizes.md,
    textAlign: "center",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  noDataText: {
    textAlign: "center",
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.md,
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

export default StatusScreen;
