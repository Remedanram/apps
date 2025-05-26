import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Card from "../components/Card";
import theme from "../constants/theme";
import { mockMonthlyRooms } from "../services/mockData";

interface PendingRoom {
  id: number;
  number: string;
  tenant: string;
  amount: number;
  dueDate: string;
  status: string;
}

const PendingRoomsScreen = () => {
  const renderRoomItem = ({ item }: { item: PendingRoom }) => (
    <Card style={styles.roomCard}>
      <View style={styles.roomHeader}>
        <View>
          <Text style={styles.roomNumber}>Room {item.number}</Text>
          <Text style={styles.tenantName}>{item.tenant}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>${item.amount}</Text>
          <Text style={styles.dueDate}>
            Due: {new Date(item.dueDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.statusContainer}>
        <View style={styles.statusBadge}>
          <Feather name="clock" size={16} color={theme.colors.warning} />
          <Text style={styles.statusText}>Pending</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockMonthlyRooms.pending}
        renderItem={renderRoomItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  roomCard: {
    padding: theme.spacing.md,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  roomNumber: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    color: theme.colors.text.primary,
  },
  tenantName: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "700",
    color: theme.colors.warning,
  },
  dueDate: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  statusContainer: {
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.warning + "20",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: "flex-start",
  },
  statusText: {
    marginLeft: theme.spacing.xs,
    color: theme.colors.warning,
    fontSize: theme.typography.sizes.sm,
    fontWeight: "600",
  },
});

export default PendingRoomsScreen;
