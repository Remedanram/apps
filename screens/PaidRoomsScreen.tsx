import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Card from "../components/Card";
import theme from "../constants/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import matchService, { MatchRoom } from "../services/matchService";
import { useBuilding } from "../contexts/BuildingContext";

type Props = NativeStackScreenProps<RootStackParamList, "PaidRooms">;

const PaidRoomsScreen: React.FC<Props> = ({ route }) => {
  const { period } = route.params;
  const { selectedBuilding } = useBuilding();
  const [loading, setLoading] = useState(true);
  const [paidRooms, setPaidRooms] = useState<MatchRoom[]>([]);

  useEffect(() => {
    if (selectedBuilding?.id) {
      loadData();
    }
  }, [period, selectedBuilding]);

  const loadData = async () => {
    if (!selectedBuilding?.id) return;
    try {
      setLoading(true);
      const rooms = await matchService.getPaidRooms(
        selectedBuilding.id,
        period
      );
      setPaidRooms(Array.isArray(rooms) ? rooms : []);
    } catch (error) {
      console.error("Error loading paid rooms:", error);
      setPaidRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const renderRoomItem = ({ item }: { item: MatchRoom }) => (
    <Card style={styles.roomCard}>
      <View style={styles.roomHeader}>
        <View>
          <Text style={styles.roomNumber}>{item.roomName}</Text>
          <Text style={styles.tenantName}>{item.tenantName}</Text>
          {item.paymentMethod && (
            <View style={styles.paymentMethodBadge}>
              <Text style={styles.paymentMethodText}>
                {item.paymentMethod.replace(/_/g, " ")}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>${item.amount}</Text>
          <Text style={styles.paymentDate}>
            Paid:{" "}
            {item.day
              ? new Date(item.day).toLocaleDateString()
              : "Date not set"}
          </Text>
        </View>
      </View>
      <View style={styles.statusContainer}>
        <View style={styles.statusBadge}>
          <Feather name="check-circle" size={16} color={theme.colors.success} />
          <Text style={styles.statusText}>Paid</Text>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading paid rooms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={paidRooms}
        renderItem={renderRoomItem}
        keyExtractor={(item) => item.roomName}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.noDataText}>No paid rooms for {period}</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
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
    color: theme.colors.success,
  },
  paymentDate: {
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
    backgroundColor: theme.colors.success + "20",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: "flex-start",
  },
  statusText: {
    marginLeft: theme.spacing.xs,
    color: theme.colors.success,
    fontSize: theme.typography.sizes.sm,
    fontWeight: "600",
  },
  noDataText: {
    textAlign: "center",
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.md,
    padding: theme.spacing.md,
    fontStyle: "italic",
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

export default PaidRoomsScreen;
