import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MonthlyStackParamList } from "../navigation/AppNavigator";
import Card from "../components/Card";
import { Feather } from "@expo/vector-icons";
import theme from "../constants/theme";
import { format } from "date-fns";
import matchService, { MatchRoom } from "../services/matchService";

type Props = NativeStackScreenProps<MonthlyStackParamList, "MonthlyDetails">;

const MonthlyDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { month, year } = route.params;
  const [paidRooms, setPaidRooms] = useState<MatchRoom[]>([]);
  const [unpaidRooms, setUnpaidRooms] = useState<MatchRoom[]>([]);

  useEffect(() => {
    loadData();
  }, [month, year]);

  const loadData = async () => {
    try {
      const [paid, unpaid] = await Promise.all([
        matchService.getPaidRooms(month, year),
        matchService.getUnpaidRooms(month, year),
      ]);
      setPaidRooms(Array.isArray(paid) ? paid : []);
      setUnpaidRooms(Array.isArray(unpaid) ? unpaid : []);
    } catch (error) {
      console.error("Error loading monthly details:", error);
      setPaidRooms([]);
      setUnpaidRooms([]);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthTitle}>
          {month} {year}
        </Text>
      </View>

      {/* Paid Rooms Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="check-circle" size={20} color={theme.colors.success} />
          <Text style={[styles.sectionTitle, { color: theme.colors.success }]}>
            Paid Rooms
          </Text>
        </View>
        {paidRooms.length > 0 ? (
          paidRooms.map((room) => (
            <Card key={room.roomName} style={styles.roomCard}>
              <View style={styles.roomInfo}>
                <View>
                  <Text style={styles.roomNumber}>{room.roomName}</Text>
                  <Text style={styles.tenantName}>{room.tenantName}</Text>
                  <Text style={styles.statusText}>
                    Status: {room.status.replace(/_/g, " ")}
                  </Text>
                </View>
                <View style={styles.amountContainer}>
                  <Text
                    style={[styles.amount, { color: theme.colors.success }]}
                  >
                    ${room.amount}
                  </Text>
                  <Text style={styles.date}>Paid: {formatDate(room.day)}</Text>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <Text style={styles.noDataText}>No paid rooms for this month</Text>
        )}
      </View>

      {/* Pending Rooms Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="clock" size={20} color={theme.colors.warning} />
          <Text style={[styles.sectionTitle, { color: theme.colors.warning }]}>
            Pending Rooms
          </Text>
        </View>
        {unpaidRooms.length > 0 ? (
          unpaidRooms.map((room) => (
            <Card key={room.roomName} style={styles.roomCard}>
              <View style={styles.roomInfo}>
                <View>
                  <Text style={styles.roomNumber}>{room.roomName}</Text>
                  <Text style={styles.tenantName}>{room.tenantName}</Text>
                  <Text style={styles.statusText}>
                    Status: {room.status.replace(/_/g, " ")}
                  </Text>
                </View>
                <View style={styles.amountContainer}>
                  <Text
                    style={[styles.amount, { color: theme.colors.warning }]}
                  >
                    ${room.amount}
                  </Text>
                  <Text style={styles.date}>Due: {formatDate(room.day)}</Text>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <Text style={styles.noDataText}>No pending rooms for this month</Text>
        )}
      </View>

      {/* Summary Section */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Monthly Summary</Text>
        <View style={styles.summaryContent}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Paid</Text>
            <Text
              style={[styles.summaryValue, { color: theme.colors.success }]}
            >
              ${paidRooms.reduce((sum, room) => sum + room.amount, 0)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Pending</Text>
            <Text
              style={[styles.summaryValue, { color: theme.colors.warning }]}
            >
              ${unpaidRooms.reduce((sum, room) => sum + room.amount, 0)}
            </Text>
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
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    marginBottom: theme.spacing.md,
  },
  monthTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "600",
    color: theme.colors.text.primary,
    textAlign: "center",
  },
  section: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  roomCard: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  roomInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomNumber: {
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
    color: theme.colors.text.primary,
  },
  tenantName: {
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
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "700",
  },
  date: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  summaryCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
  },
  summaryTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  summaryContent: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "700",
  },
  noDataText: {
    textAlign: "center",
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.md,
    padding: theme.spacing.md,
    fontStyle: "italic",
  },
});

export default MonthlyDetailsScreen;
