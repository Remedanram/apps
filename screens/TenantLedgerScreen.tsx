import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Card from "../components/Card";
import { RootStackParamList } from "../navigation/AppNavigator";
import theme from "../constants/theme";

type Props = NativeStackScreenProps<RootStackParamList, "TenantLedger">;

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: "PAYMENT" | "CHARGE";
  description: string;
}

export default function TenantLedgerScreen({ route }: Props) {
  const { phoneNumber } = route.params;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchTenantLedger = async () => {
      try {
        // Simulate API call
        const mockTransactions: Transaction[] = [
          {
            id: "1",
            date: "2024-03-01",
            amount: 1000,
            type: "CHARGE",
            description: "Monthly Rent",
          },
          {
            id: "2",
            date: "2024-03-05",
            amount: 1000,
            type: "PAYMENT",
            description: "Rent Payment",
          },
        ];

        setTransactions(mockTransactions);
        setBalance(
          mockTransactions.reduce(
            (acc, curr) =>
              curr.type === "CHARGE" ? acc + curr.amount : acc - curr.amount,
            0
          )
        );
      } catch (error) {
        console.error("Error fetching tenant ledger:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantLedger();
  }, [phoneNumber]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text
          style={[
            styles.balanceAmount,
            { color: balance > 0 ? theme.colors.error : theme.colors.success },
          ]}
        >
          ${Math.abs(balance).toFixed(2)}
        </Text>
        <Text style={styles.balanceStatus}>
          {balance > 0 ? "Outstanding" : "Paid"}
        </Text>
      </Card>

      <Text style={styles.sectionTitle}>Transaction History</Text>
      {transactions.map((transaction) => (
        <Card key={transaction.id} style={styles.transactionCard}>
          <View style={styles.transactionHeader}>
            <Text style={styles.date}>
              {new Date(transaction.date).toLocaleDateString()}
            </Text>
            <Text
              style={[
                styles.amount,
                {
                  color:
                    transaction.type === "CHARGE"
                      ? theme.colors.error
                      : theme.colors.success,
                },
              ]}
            >
              {transaction.type === "CHARGE" ? "-" : "+"}$
              {transaction.amount.toFixed(2)}
            </Text>
          </View>
          <Text style={styles.description}>{transaction.description}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
  },
  balanceCard: {
    alignItems: "center",
    padding: theme.spacing.large,
    marginBottom: theme.spacing.large,
  },
  balanceLabel: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: theme.spacing.small,
  },
  balanceStatus: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: theme.spacing.medium,
    color: theme.colors.text,
  },
  transactionCard: {
    marginBottom: theme.spacing.small,
    padding: theme.spacing.medium,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.small,
  },
  date: {
    color: theme.colors.textSecondary,
  },
  amount: {
    fontWeight: "bold",
  },
  description: {
    color: theme.colors.text,
  },
});
