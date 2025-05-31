import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
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

const mockMonths = [
  "Jan 2024",
  "Feb 2024",
  "Mar 2024",
  "Apr 2024",
  "May 2024",
  "Jun 2024",
];

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

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <View style={[styles.headerCell, styles.roomCell]}>
        <Text style={styles.headerText}>Room</Text>
      </View>
      {mockMonths.map((month) => (
        <View key={month} style={styles.headerCell}>
          <Text style={styles.headerText}>{month}</Text>
        </View>
      ))}
    </View>
  );

  const renderTableRow = (room: (typeof mockRooms)[0]) => (
    <View key={room.roomName} style={styles.tableRow}>
      <View style={[styles.cell, styles.roomCell]}>
        <Text style={styles.roomName}>{room.roomName}</Text>
        <Text style={styles.tenantName}>{room.tenant}</Text>
      </View>
      {mockMonths.map((month) => (
        <View key={month} style={styles.cell}>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor:
                  room.status === "Paid"
                    ? theme.colors.success + "20"
                    : theme.colors.warning + "20",
              },
            ]}
          >
            <Feather
              name={room.status === "Paid" ? "check-circle" : "clock"}
              size={16}
              color={
                room.status === "Paid"
                  ? theme.colors.success
                  : theme.colors.warning
              }
            />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.occupancyCard}>
        <Text style={styles.cardTitle}>Occupancy Status</Text>
        <Text style={styles.occupancyRate}>{occupancyRate.toFixed(1)}%</Text>
        <View style={styles.roomStats}>
          <View style={styles.roomStat}>
            <Text style={styles.roomStatValue}>{roomStats.totalRooms}</Text>
            <Text style={styles.roomStatLabel}>Total Rooms</Text>
          </View>
          <View style={styles.roomStat}>
            <Text style={styles.roomStatValue}>{roomStats.activeRooms}</Text>
            <Text style={styles.roomStatLabel}>Active</Text>
          </View>
          <View style={styles.roomStat}>
            <Text style={styles.roomStatValue}>{roomStats.inactiveRooms}</Text>
            <Text style={styles.roomStatLabel}>Inactive</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.tableCard}>
        <Text style={styles.cardTitle}>Payment Status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {renderTableHeader()}
            {mockRooms.map(renderTableRow)}
          </View>
        </ScrollView>
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
  occupancyCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  occupancyRate: {
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: "700",
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  roomStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  roomStat: {
    alignItems: "center",
  },
  roomStatValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "700",
  },
  roomStatLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  tableCard: {
    padding: theme.spacing.md,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  headerCell: {
    padding: theme.spacing.sm,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  roomCell: {
    width: 150,
    alignItems: "flex-start",
  },
  headerText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: "600",
    color: theme.colors.text.secondary,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cell: {
    padding: theme.spacing.sm,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
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
});

export default StatusScreen;
