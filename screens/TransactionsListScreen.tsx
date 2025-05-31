import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Card from "../components/Card";
import theme from "../constants/theme";
import { Transaction as GlobalTransaction } from "../types/navigation";
import { mockTransactions } from "../services/mockData";
import api from "../services/api";

interface Transaction {
  id: number;
  bankTxnId: string;
  txnDate: string;
  amount: number;
  senderName: string;
  senderPhone: string;
  description: string;
  importedAt: string;
}

interface TransactionsListScreenProps {
  status?: string;
  showRecent?: boolean;
}

type RootStackParamList = {
  TransactionsList: { showRecent?: boolean; status?: string };
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TransactionsList"
>;

const TransactionsListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route =
    useRoute<RouteProp<Record<string, TransactionsListScreenProps>, string>>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchRecentTransactions = async () => {
    setLoadingRecent(true);
    setError(null);
    try {
      console.log("Attempting to fetch recent transactions...");
      const { data } = await api.get("/transactions/recentTransactions");
      console.log("Recent transactions fetched successfully:", data);
      setRecentTransactions(data);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load recent transactions";
      setError(errorMessage);
      Alert.alert(
        "Connection Error",
        "Unable to connect to the server. Please check your network connection and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoadingRecent(false);
    }
  };

  const fetchTransactions = async (pageNumber: number) => {
    if (loading || (pageNumber > 1 && !hasMore)) return;

    setLoading(true);
    setError(null);
    try {
      console.log("Attempting to fetch all transactions...");
      const { data } = await api.get("/transactions/allTransactions");
      console.log("All transactions fetched successfully:", data);
      setAllTransactions(data);
      setTransactions(data);
      setHasMore(data.length === 10);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load transactions";
      setError(errorMessage);
      Alert.alert(
        "Connection Error",
        "Unable to connect to the server. Please check your network connection and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const testApiConnection = async () => {
    try {
      console.log("Testing API connection to:", api.getBaseUrl());
      const isConnected = await api.testConnection();
      console.log("API Connection test result:", isConnected);
      if (!isConnected) {
        setError("Unable to connect to the server");
        Alert.alert(
          "Connection Error",
          "Unable to connect to the server. Please check your network connection and try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("API Connection test failed:", error);
      setError("Connection test failed");
    }
  };

  useEffect(() => {
    testApiConnection();
    if (route.params?.showRecent) {
      fetchRecentTransactions();
    } else {
      fetchTransactions(1);
    }
  }, [route.params?.showRecent]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setTransactions(allTransactions);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allTransactions.filter(
      (transaction) =>
        transaction.senderName.toLowerCase().includes(query) ||
        transaction.senderPhone.toLowerCase().includes(query) ||
        transaction.bankTxnId.toLowerCase().includes(query) ||
        transaction.description.toLowerCase().includes(query) ||
        transaction.amount.toString().includes(query)
    );
    setTransactions(filtered);
  }, [searchQuery, allTransactions]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTransactions(nextPage);
    }
  };

  const handleViewAll = () => {
    navigation.navigate("TransactionsList", { showRecent: false });
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <Card variant="outlined" style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <Text style={styles.date}>
          {new Date(item.txnDate).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Transaction ID:</Text>
          <Text style={styles.value}>{item.bankTxnId}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Sender:</Text>
          <Text style={styles.value}>{item.senderName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{item.senderPhone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.value}>${item.amount.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value}>{item.description}</Text>
        </View>
      </View>
    </Card>
  );

  const renderRecentTransactions = () => {
    if (loadingRecent) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      );
    }

    return (
      <View>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent Transactions</Text>
          <TouchableOpacity
            onPress={handleViewAll}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Feather
              name="chevron-right"
              size={16}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
        <FlatList
          data={recentTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            if (route.params?.showRecent) {
              fetchRecentTransactions();
            } else {
              fetchTransactions(1);
            }
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Export Button Container */}
      <View style={styles.exportButtonContainer}>
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      {renderError()}
      {route.params?.showRecent ? (
        renderRecentTransactions()
      ) : (
        <>
          <Card variant="outlined" style={styles.searchCard}>
            <View style={styles.searchContainer}>
              <Feather
                name="search"
                size={20}
                color={theme.colors.text.secondary}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search transactions..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={styles.clearButton}
                >
                  <Feather
                    name="x"
                    size={20}
                    color={theme.colors.text.secondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </Card>

          <FlatList
            data={transactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id.toString()}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={() =>
              !loading && !error ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? "No matching transactions found"
                      : "No transactions found"}
                  </Text>
                </View>
              ) : null
            }
            ListFooterComponent={() =>
              loading ? (
                <View style={styles.loader}>
                  <ActivityIndicator color={theme.colors.primary} />
                </View>
              ) : null
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchCard: {
    margin: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.sizes.md,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  transactionCard: {
    margin: theme.spacing.md,
    marginTop: 0,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  date: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  transactionDetails: {
    gap: theme.spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  value: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    fontWeight: "500",
  },
  loader: {
    padding: theme.spacing.md,
    alignItems: "center",
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  recentTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    color: theme.colors.text.primary,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  errorContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.error + "10",
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.sizes.md,
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.card,
    fontSize: theme.typography.sizes.md,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.md,
  },
  exportButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
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

export default TransactionsListScreen;
