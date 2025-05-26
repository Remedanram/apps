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
});

export default StatusScreen;
