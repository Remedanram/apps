import React, { useState, useCallback, useLayoutEffect } from "react";
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
import { Tenant, TenantStatus } from "../types/tenant";
import { useFocusEffect } from "@react-navigation/native";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "TenantList">;
};

const TenantListScreen: React.FC<Props> = ({ navigation }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { selectedBuilding } = useBuilding();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: theme.colors.card },
      headerTintColor: theme.colors.text.primary,
      headerTitleStyle: { fontWeight: "600" },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: theme.spacing.md }}
        >
          <Feather
            name="arrow-left"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
      ),
      headerTitle: "Tenants",
    });
  }, [navigation]);

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

  const handleDeleteTenant = async (tenant: Tenant) => {
    if (!tenant.id) {
      Alert.alert("Error", "Tenant ID is missing. Cannot delete this tenant.");
      return;
    }
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
                tenant.room.id!,
                tenant.id.toString()
              );
              fetchTenants();
              Alert.alert("Success", "Tenant deleted successfully");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete tenant");
            }
          },
        },
      ]
    );
  };

  const handleEditTenant = (tenant: Tenant) => {
    navigation.navigate("EditTenant", { tenant });
  };

  const handleActivateTenant = async (tenant: Tenant) => {
    try {
      if (!selectedBuilding?.id) return;
      await tenantService.activateTenant(selectedBuilding.id, tenant.room.id!);
      fetchTenants();
      Alert.alert("Success", "Tenant activated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to activate tenant");
    }
  };

  const handleDeactivateTenant = async (tenant: Tenant) => {
    Alert.alert(
      "Deactivate Tenant",
      "Are you sure you want to deactivate this tenant?",
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
              if (!selectedBuilding?.id) return;
              await tenantService.deactivateTenant(
                selectedBuilding.id,
                tenant.room.id!
              );
              fetchTenants();
              Alert.alert("Success", "Tenant deactivated successfully");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to deactivate tenant"
              );
            }
          },
        },
      ]
    );
  };

  const handleMoreOptions = (tenant: Tenant) => {
    const options = [
      {
        text: "Edit",
        onPress: () => handleEditTenant(tenant),
      },
      {
        text: tenant.status === TenantStatus.ACTIVE ? "Deactivate" : "Activate",
        onPress: () => {
          if (tenant.status === TenantStatus.ACTIVE) {
            handleDeactivateTenant(tenant);
          } else {
            handleActivateTenant(tenant);
          }
        },
      },
      {
        text: "Delete",
        onPress: () => handleDeleteTenant(tenant),
        style: "destructive" as "destructive",
      },
      {
        text: "Cancel",
        style: "cancel" as "cancel",
      },
    ];

    Alert.alert("Tenant Actions", "Choose an action", options);
  };

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant.email &&
        tenant.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tenant.room?.roomName &&
        tenant.room.roomName.toLowerCase().includes(searchQuery.toLowerCase()))
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
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredTenants}
        keyExtractor={(item) =>
          `${item.room?.roomName || "no-room"}-${item.phone}`
        }
        renderItem={({ item }) => (
          <Card style={styles.tenantCard}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarCircle}>
                <Feather name="user" size={36} color={theme.colors.primary} />
              </View>
              <View style={styles.statusBadgeWrapper}>
                <Text
                  style={[
                    styles.statusBadge,
                    item.status === TenantStatus.ACTIVE
                      ? styles.statusActive
                      : styles.statusInactive,
                  ]}
                >
                  {item.status === TenantStatus.ACTIVE ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.tenantName}>{item.name}</Text>
              <Text style={styles.tenantCode}>Tenant Code: {item.id}</Text>
              <Text style={styles.tenantDetailsAccent}>
                Room: {item.room?.roomName}
              </Text>
              <Text style={styles.tenantDetails}>Phone: {item.phone}</Text>
              {item.email && (
                <Text style={styles.tenantDetails}>Email: {item.email}</Text>
              )}
              <Text style={styles.tenantDetailsAccent}>
                Rent: {item.room?.rentAmount}
              </Text>
              {item.room?.description && (
                <Text style={styles.tenantDetails}>
                  {item.room.description}
                </Text>
              )}
              <Text style={styles.tenantDetails}>
                Move-in: {new Date(item.moveInDate).toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleMoreOptions(item)}
              style={styles.moreOptions}
            >
              <Feather
                name="more-vertical"
                size={24}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Feather name="users" size={48} color={theme.colors.primary} />
            <Text style={styles.noTenantsText}>No tenants available</Text>
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
    paddingTop: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    shadowColor: theme.shadows.small.shadowColor,
    shadowOffset: theme.shadows.small.shadowOffset,
    shadowOpacity: theme.shadows.small.shadowOpacity,
    shadowRadius: theme.shadows.small.shadowRadius,
    elevation: theme.shadows.small.elevation,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  avatarSection: {
    alignItems: "center",
    marginRight: theme.spacing.md,
    justifyContent: "center",
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary + "22",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
  },
  statusBadgeWrapper: {
    alignItems: "center",
  },
  statusBadge: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: "bold",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: "hidden",
    color: theme.colors.card,
    marginTop: 2,
  },
  statusActive: {
    backgroundColor: theme.colors.success,
  },
  statusInactive: {
    backgroundColor: theme.colors.error,
  },
  tenantCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.card,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  tenantName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  tenantCode: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    fontWeight: "500",
  },
  tenantDetailsAccent: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.info,
    marginBottom: theme.spacing.xs,
    fontWeight: "600",
  },
  tenantDetails: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  moreOptions: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 1,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.xl,
  },
  noTenantsText: {
    textAlign: "center",
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.lg,
    marginTop: theme.spacing.md,
    fontWeight: "600",
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: theme.spacing.md,
  },
});

export default TenantListScreen;
