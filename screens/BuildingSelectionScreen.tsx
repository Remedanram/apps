import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import theme from "../constants/theme";
import buildingService, { Building } from "../services/buildingService";
import { Card } from "../components";
import { useBuilding } from "../contexts/BuildingContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import api from "../services/api";

type Props = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "BuildingSelection"
  >;
};

const BuildingSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { setSelectedBuilding } = useBuilding();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const response = await api.get("/buildings");
      if (response?.data) {
        setBuildings(response.data);
      }
    } catch (error) {
      console.error("Error fetching buildings:", error);
      Alert.alert("Error", "Failed to load buildings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuildingSelect = (building: Building) => {
    setSelectedBuilding(building);
    navigation.navigate("Main");
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
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Select a Building</Text>
        {buildings.length === 0 ? (
          <Text style={styles.noBuildingsText}>No buildings available</Text>
        ) : (
          <FlatList
            data={buildings}
            renderItem={renderBuildingItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No buildings available</Text>
            }
          />
        )}
      </Card>
    </ScrollView>
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
  card: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
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
  noBuildingsText: {
    textAlign: "center",
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.md,
    fontStyle: "italic",
  },
});

export default BuildingSelectionScreen;
