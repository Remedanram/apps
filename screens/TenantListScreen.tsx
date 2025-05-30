import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Text } from "react-native";
import { Card } from "../components";
import theme from "../constants/theme";
import tenantService, { Tenant } from "../services/tenantService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { Feather } from "@expo/vector-icons";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "TenantList">;
};

const TenantListScreen: React.FC<Props> = ({ navigation }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [totalTenants, setTotalTenants] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
    fetchTotalTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await tenantService.getAllTenants();
      console.log("Fetched tenants:", response);
      setTenants(response);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      Alert.alert("Error", "Failed to load tenants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalTenants = async () => {
    try {
      const stats = await tenantService.getTotalTenants();
      console.log("Fetched total tenants:", stats);
      setTotalTenants(stats.totalTenants);
    } catch (error) {
      console.error("Error fetching total tenants:", error);
    }
  };

  const handleEditTenant = (tenant: Tenant) => {
    navigation.navigate("EditTenant", { tenant });
  };

  const handleDeleteTenant = async (tenant: Tenant) => {
    Alert.alert(
      "Delete Tenant",
      `Are you sure you want to delete tenant ${tenant.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await tenantService.deleteTenant(tenant.id);
              fetchTenants(); // Reload the tenant list
            } catch (error) {
              console.error("Error deleting tenant:", error);
              Alert.alert("Error", "Failed to delete tenant");
            }
          },
        },
      ]
    );
  };

  const renderTenantItem = ({ item }: { item: Tenant }) => (
    <Card style={styles.tenantCard}>
      <Text style={styles.tenantName}>{item.name}</Text>
      <Text style={styles.tenantDetails}>Phone: {item.phone}</Text>
      <Text style={styles.tenantDetails}>Room: {item.room.roomName}</Text>
      <Text style={styles.tenantDetails}>Rent: ${item.room.rentAmount}</Text>
      <Text style={styles.tenantDetails}>
        Description: {item.room.description}
      </Text>
      {item.moveInDate && (
        <Text style={styles.tenantDetails}>
          Move-in Date: {new Date(item.moveInDate).toLocaleDateString()}
        </Text>
      )}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditTenant(item)}
        >
          <Feather name="edit" size={20} color={theme.colors.primary} />
          <Text
            style={[styles.actionButtonText, { color: theme.colors.primary }]}
          >
            Edit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteTenant(item)}
        >
          <Feather name="trash-2" size={20} color={theme.colors.error} />
          <Text
            style={[styles.actionButtonText, { color: theme.colors.error }]}
          >
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Total Tenants</Text>
        <Text style={styles.statsNumber}>{totalTenants}</Text>
      </Card>

      <Text style={styles.sectionTitle}>Tenant List</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading tenants...</Text>
      ) : (
        <FlatList
          data={tenants}
          renderItem={renderTenantItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  statsCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  statsTitle: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.secondary,
  },
  statsNumber: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "bold",
    marginBottom: theme.spacing.md,
  },
  listContainer: {
    paddingBottom: theme.spacing.lg,
  },
  tenantCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  tenantName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  tenantDetails: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  loadingText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginTop: theme.spacing.xl,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
    minWidth: 80,
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: theme.colors.primary + "20",
  },
  deleteButton: {
    backgroundColor: theme.colors.error + "20",
  },
  actionButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: "600",
  },
});

export default TenantListScreen;
