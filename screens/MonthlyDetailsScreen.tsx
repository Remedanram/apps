import React from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MonthlyStackParamList } from "../navigation/AppNavigator";
import { mockMonthlyRooms } from "../services/mockData";
import Card from "../components/Card";
import { Feather } from "@expo/vector-icons";
import theme from "../constants/theme";
import { format } from "date-fns";

type Props = NativeStackScreenProps<MonthlyStackParamList, "MonthlyDetails">;

const MonthlyDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { month } = route.params;
  const { paid, pending } = mockMonthlyRooms;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthTitle}>
          {format(new Date(month), "MMMM yyyy")}
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
        {paid.map((room) => (
          <Card key={room.id} style={styles.roomCard}>
            <View style={styles.roomInfo}>
              <View>
                <Text style={styles.roomNumber}>Room {room.number}</Text>
                <Text style={styles.tenantName}>{room.tenant}</Text>
              </View>
              <View style={styles.amountContainer}>
                <Text style={[styles.amount, { color: theme.colors.success }]}>
                  ${room.amount}
                </Text>
                <Text style={styles.date}>
                  Paid: {new Date(room.paymentDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* Pending Rooms Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="clock" size={20} color={theme.colors.warning} />
          <Text style={[styles.sectionTitle, { color: theme.colors.warning }]}>
            Pending Rooms
          </Text>
        </View>
        {pending.map((room) => (
          <Card key={room.id} style={styles.roomCard}>
            <View style={styles.roomInfo}>
              <View>
                <Text style={styles.roomNumber}>Room {room.number}</Text>
                <Text style={styles.tenantName}>{room.tenant}</Text>
              </View>
              <View style={styles.amountContainer}>
                <Text style={[styles.amount, { color: theme.colors.warning }]}>
                  ${room.amount}
                </Text>
                <Text style={styles.date}>
                  Due: {new Date(room.dueDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </Card>
        ))}
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
              ${paid.reduce((sum, room) => sum + room.amount, 0)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Pending</Text>
            <Text
              style={[styles.summaryValue, { color: theme.colors.warning }]}
            >
              ${pending.reduce((sum, room) => sum + room.amount, 0)}
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
});

export default MonthlyDetailsScreen;
