import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { Text } from "react-native";
import Card from "../components/Card";
import theme from "../constants/theme";
import { Feather } from "@expo/vector-icons";
import roomService from "../services/roomService";
import type { RoomStats } from "../types/room";

// Mock data for the status table
const mockRooms = [
  { roomName: "Room1", tenant: "John Doe", status: "Paid" },
  { roomName: "Room2", tenant: "Jane Smith", status: "Pending" },
  { roomName: "Room3", tenant: "Mike Johnson", status: "Paid" },
  { roomName: "Room4", tenant: "Sarah Wilson", status: "Pending" },
  { roomName: "Room5", tenant: "Tom Brown", status: "Paid" },
];

const mockMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const StatusScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roomStats, setRoomStats] = useState<RoomStats>({
    totalRooms: 0,
    activeRooms: 0,
    inactiveRooms: 0,
  });

  const loadRoomStats = async () => {
    try {
      setLoading(true);
      const stats = await roomService.getTotalRooms();
      setRoomStats(stats);
    } catch (error) {
      console.error("Error loading room stats:", error);
      Alert.alert("Error", "Failed to load room statistics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRoomStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRoomStats();
  };

  const occupancyRate =
    (roomStats.activeRooms / roomStats.totalRooms) * 100 || 0;

  const renderStatusCell = (status: string) => (
    <View
      style={[
        styles.statusIndicator,
        {
          backgroundColor:
            status === "Paid"
              ? theme.colors.success + "20"
              : theme.colors.warning + "20",
        },
      ]}
    >
      <Feather
        name={status === "Paid" ? "check-circle" : "clock"}
        size={16}
        color={status === "Paid" ? theme.colors.success : theme.colors.warning}
      />
    </View>
  );

  const renderStickyRoomColumn = () => (
    <View>
      <View style={[styles.tableHeader, styles.stickyHeader]}>
        <Text style={styles.headerText}>Room</Text>
      </View>
      {mockRooms.map((room) => (
        <View key={room.roomName} style={[styles.tableRow, styles.stickyRow]}>
          <Text style={styles.roomName}>{room.roomName}</Text>
          <Text style={styles.tenantName}>{room.tenant}</Text>
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
          {mockMonths.map((month) => (
            <View key={month} style={styles.headerCell}>
              <Text style={styles.headerText}>{month}</Text>
            </View>
          ))}
        </View>
        {mockRooms.map((room) => (
          <View key={room.roomName} style={styles.tableRow}>
            {mockMonths.map((month) => (
              <View key={month} style={styles.cell}>
                {renderStatusCell(room.status)}
              </View>
            ))}
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
            <View style={styles.yearButton}>
              <Text style={styles.yearButtonText}>2024 ▼</Text>
            </View>
            <View style={styles.exportButton}>
              <Text style={styles.exportButtonText}>Export</Text>
            </View>
          </View>
        </View>
        <View style={styles.tableWrapper}>
          {renderStickyRoomColumn()}
          {renderScrollableContent()}
        </View>
      </Card>
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
});

export default StatusScreen;
