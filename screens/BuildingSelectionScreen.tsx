import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
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
import AddBuildingModal from "../components/AddBuildingModal";

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
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    checkUserStatus();
    fetchBuildings();
  }, []);

  const checkUserStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        // Check if this is a new user (just signed up)
        const isNew = await AsyncStorage.getItem("isNewUser");
        if (isNew === "true") {
          setIsNewUser(true);
          await AsyncStorage.removeItem("isNewUser"); // Clear the flag
        }
      }
    } catch (error) {
      console.error("Error checking user status:", error);
    }
  };

  const fetchBuildings = async () => {
    try {
      const buildings = await buildingService.getAllBuildings();
      setBuildings(buildings);

      // If new user and no buildings, show create building modal
      if (isNewUser && buildings.length === 0) {
        setShowAddBuildingModal(true);
      }
    } catch (error) {
      console.error("Error fetching buildings:", error);
      Alert.alert("Error", "Failed to load buildings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuildingSelect = async (building: Building) => {
    try {
      await setSelectedBuilding(building);
      // Add a small delay for better UX
      setTimeout(() => {
        navigation.navigate("Main");
      }, 100);
    } catch (error) {
      console.error("Error selecting building:", error);
      Alert.alert("Error", "Failed to select building. Please try again.");
    }
  };

  const handleBuildingAdded = async () => {
    // Refresh buildings list
    await fetchBuildings();

    // If this was the first building, auto-select it
    if (buildings.length === 0) {
      const updatedBuildings = await buildingService.getAllBuildings();
      if (updatedBuildings.length === 1) {
        await setSelectedBuilding(updatedBuildings[0]);
        navigation.navigate("Main");
      }
    }
  };

  const renderBuildingItem = ({ item }: { item: Building }) => (
    <TouchableOpacity
      style={styles.buildingCard}
      onPress={() => handleBuildingSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.buildingInfo}>
        <Text style={styles.buildingName}>{item.name}</Text>
        <Text style={styles.buildingCode}>Code: {item.code}</Text>
      </View>
      <View style={styles.buildingArrow}>
        <Feather
          name="chevron-right"
          size={24}
          color={theme.colors.text.secondary}
        />
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <Card style={styles.card}>
      {isNewUser && buildings.length === 0 && (
        <View style={styles.newUserContainer}>
          <Feather name="home" size={32} color={theme.colors.primary} />
          <Text style={styles.subtitle}>
            Let's get started by creating your first building
          </Text>
          <Text style={styles.newUserSubtext}>
            This will be your first property to manage
          </Text>
        </View>
      )}

      {/* Create Building Button - always visible */}
      <TouchableOpacity
        style={[
          styles.createBuildingButton,
          isNewUser &&
            buildings.length === 0 &&
            styles.createBuildingButtonPrimary,
        ]}
        onPress={() => setShowAddBuildingModal(true)}
      >
        <Feather
          name="plus"
          size={20}
          color={
            isNewUser && buildings.length === 0 ? "white" : theme.colors.primary
          }
        />
        <Text
          style={[
            styles.createBuildingButtonText,
            isNewUser &&
              buildings.length === 0 &&
              styles.createBuildingButtonTextPrimary,
          ]}
        >
          {isNewUser ? "Create Your First Building" : "Create New Building"}
        </Text>
      </TouchableOpacity>
    </Card>
  );

  const renderEmptyComponent = () => (
    <View style={styles.noBuildingsContainer}>
      <Feather name="home" size={48} color={theme.colors.text.tertiary} />
      <Text style={styles.noBuildingsText}>
        {isNewUser
          ? "Welcome! Let's create your first building"
          : "No buildings available"}
      </Text>
      <Text style={styles.noBuildingsSubtext}>
        {isNewUser
          ? "This will be your first property to manage"
          : "Create your first building to get started"}
      </Text>
    </View>
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
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        {!isNewUser ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather
              name="arrow-left"
              size={24}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        <Text style={styles.headerTitle}>
          {isNewUser ? "Create Building" : "Select Building"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={buildings}
        renderItem={renderBuildingItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        scrollsToTop={false}
        automaticallyAdjustContentInsets={false}
        keyboardShouldPersistTaps="handled"
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        ref={flatListRef}
      />
      {showAddBuildingModal && (
        <AddBuildingModal
          visible={showAddBuildingModal}
          onBuildingAdded={handleBuildingAdded}
          onClose={() => setShowAddBuildingModal(false)}
          isNewUser={isNewUser}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 50,
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
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  buildingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  createBuildingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  createBuildingButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  noBuildingsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.xxl,
  },
  noBuildingsText: {
    textAlign: "center",
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.md,
    fontStyle: "italic",
    marginTop: theme.spacing.md,
  },
  noBuildingsSubtext: {
    textAlign: "center",
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.sizes.md,
    marginTop: theme.spacing.sm,
  },
  newUserContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
  },
  newUserSubtext: {
    textAlign: "center",
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.sizes.md,
    marginTop: theme.spacing.sm,
  },
  createBuildingButtonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  createBuildingButtonTextPrimary: {
    color: "white",
  },
  buildingArrow: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.sm,
  },
  backButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.card,
    ...theme.shadows.small,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: "center",
    marginHorizontal: theme.spacing.md,
  },
  headerSpacer: {
    width: 40, // Same width as back button for centering
  },
});

export default BuildingSelectionScreen;
