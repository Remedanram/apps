import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native";
import { Card } from "../components";
import theme from "../constants/theme";
import tenantService from "../services/tenantService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { Feather } from "@expo/vector-icons";
import { useBuilding } from "../contexts/BuildingContext";
import { Tenant } from "../types/tenant";
import { useFocusEffect } from "@react-navigation/native";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "TenantList">;
};

const TenantListScreen: React.FC<Props> = ({ navigation }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { selectedBuilding } = useBuilding();

  const fetchTenants = useCallback(async () => {
    try {
      if (!selectedBuilding?.id) return;
      setLoading(true);
      const tenantsList = await tenantService.getAllTenants(
        selectedBuilding.id
      );
      setTenants(tenantsList);
    } catch (error: any) {
      console.error("Error fetching tenants:", error);
      Alert.alert("Error", "Failed to load tenants. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedBuilding?.id]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (selectedBuilding?.id) {
        fetchTenants();
      } else {
        Alert.alert("Error", "Please select a building first");
        navigation.goBack();
      }
    }, [selectedBuilding?.id, fetchTenants])
  );

  const handleEditTenant = (tenant: Tenant) => {
    navigation.navigate("EditTenant", { tenant });
  };

  const handleDeleteTenant = async (roomName: string, phone: string) => {
    Alert.alert(
      "Delete Tenant",
      "Are you sure you want to delete this tenant?",
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
              if (!selectedBuilding?.id) return;
              await tenantService.deleteTenant(
                selectedBuilding.id,
                roomName,
                phone
              );
              fetchTenants(); // Refresh the list
              Alert.alert("Success", "Tenant deleted successfully");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete tenant");
            }
          },
        },
      ]
    );
  };

  const handleDeactivateTenant = async (tenant: Tenant) => {
    Alert.alert(
      "Deactivate Tenant",
      `Are you sure you want to deactivate tenant ${tenant.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: async () => {
            try {
              await tenantService.deactivateTenant(tenant.room.roomName);
              Alert.alert("Success", "Tenant deactivated successfully");
              fetchTenants(); // Reload the tenant list
            } catch (error) {
              console.error("Error deactivating tenant:", error);
              Alert.alert("Error", "Failed to deactivate tenant");
            }
          },
        },
      ]
    );
  };

  const renderTenantItem = ({ item }: { item: Tenant }) => (
    <Card style={styles.tenantCard}>
      <View style={styles.tenantHeader}>
        <Text style={styles.tenantName}>{item.name}</Text>
        <View style={styles.tenantActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditTenant(item)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() =>
              handleDeleteTenant(item.room?.roomName || "", item.phone)
            }
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.tenantDetails}>Phone: {item.phone}</Text>
      {item.email && (
        <Text style={styles.tenantDetails}>Email: {item.email}</Text>
      )}
      <Text style={styles.tenantDetails}>
        Room: {item.room?.roomName || "No room assigned"}
      </Text>
      <Text style={styles.tenantDetails}>
        Rent: ${item.room?.rentAmount || "N/A"}
      </Text>
      <Text style={styles.tenantDetails}>
        Room Description: {item.room?.description || ""}
      </Text>
      <Text style={styles.tenantDetails}>
        Tenant Description: {item.description || ""}
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
          style={[styles.actionButton, styles.deactivateButton]}
          onPress={() => handleDeactivateTenant(item)}
        >
          <Feather name="user-x" size={20} color={theme.colors.warning} />
          <Text
            style={[styles.actionButtonText, { color: theme.colors.warning }]}
          >
            Deactivate
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() =>
            handleDeleteTenant(item.room?.roomName || "", item.phone)
          }
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

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant.email &&
        tenant.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={theme.colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tenants..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredTenants}
        renderItem={renderTenantItem}
        keyExtractor={(item) =>
          `${item.room?.roomName || "no-room"}-${item.phone}`
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tenants found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.sizes.md,
  },
  listContainer: {
    paddingBottom: theme.spacing.lg,
  },
  tenantCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  tenantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  tenantName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  tenantActions: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  editButtonText: {
    color: theme.colors.card,
    fontSize: theme.typography.sizes.sm,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  deleteButtonText: {
    color: theme.colors.card,
    fontSize: theme.typography.sizes.sm,
    fontWeight: "500",
  },
  tenantDetails: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
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
  deactivateButton: {
    backgroundColor: theme.colors.warning + "20",
  },
  actionButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: "600",
  },
});

export default TenantListScreen;
