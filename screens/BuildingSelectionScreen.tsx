import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import theme from "../constants/theme";
import buildingService, { Building } from "../services/buildingService";

const BuildingSelectionScreen = () => {
  const navigation = useNavigation();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      const buildingsData = await buildingService.getAllBuildings();
      setBuildings(buildingsData);

      // If there's only one building, automatically select it
      if (buildingsData.length === 1) {
        await handleBuildingSelect(buildingsData[0]);
      }
    } catch (error) {
      console.error("Error loading buildings:", error);
      Alert.alert("Error", "Failed to load buildings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuildingSelect = async (building: Building) => {
    try {
      // Store the selected building
      await AsyncStorage.setItem("selectedBuilding", JSON.stringify(building));

      // Navigate to main screen
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" as never }],
      });
    } catch (error) {
      console.error("Error selecting building:", error);
      Alert.alert("Error", "Failed to select building. Please try again.");
    }
  };

  const renderBuildingItem = ({ item }: { item: Building }) => (
    <TouchableOpacity
      style={styles.buildingCard}
      onPress={() => handleBuildingSelect(item)}
    >
      <View style={styles.buildingInfo}>
        <Text style={styles.buildingName}>{item.name}</Text>
        <Text style={styles.buildingCode}>Code: {item.code}</Text>
      </View>
      <Feather
        name="chevron-right"
        size={24}
        color={theme.colors.text.secondary}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading buildings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="building" size={40} color={theme.colors.primary} />
        <Text style={styles.title}>Select Building</Text>
        <Text style={styles.subtitle}>Choose a building to manage</Text>
      </View>

      <FlatList
        data={buildings}
        renderItem={renderBuildingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No buildings available</Text>
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
  header: {
    alignItems: "center",
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    ...theme.shadows.small,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: "700",
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  buildingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  buildingInfo: {
    flex: 1,
  },
  buildingName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    color: theme.colors.text.primary,
  },
  buildingCode: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  emptyText: {
    textAlign: "center",
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xl,
  },
});

export default BuildingSelectionScreen;
