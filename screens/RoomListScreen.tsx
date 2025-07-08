import React, { useState, useCallback, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Text,
} from "react-native";
import { Card } from "../components";
import { Feather } from "@expo/vector-icons";
import theme from "../constants/theme";
import roomService from "../services/roomService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import api from "../services/api";
import type { Room } from "../types/room";
import { useBuilding } from "../contexts/BuildingContext";
import { useFocusEffect } from "@react-navigation/native";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "RoomList">;
};

const RoomListScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { selectedBuilding } = useBuilding();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

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
      headerTitle: "Rooms",
    });
  }, [navigation]);

  const loadRooms = useCallback(async () => {
    try {
      setError(null);
      if (!selectedBuilding?.id) return;
      setLoading(true);
      const response = await roomService.getAllRooms(selectedBuilding.id);
      setRooms(Array.isArray(response) ? response : []);
      setRetryCount(0); // Reset retry count on success
    } catch (error: any) {
      let errorMessage = "Failed to load rooms";
      if (error.message?.includes("timeout")) {
        errorMessage =
          "Server is taking too long to respond. Please check your connection and try again.";
      } else if (error.message?.includes("Network request failed")) {
        errorMessage =
          "Network connection error. Please check your internet connection.";
      } else {
        errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to load rooms";
      }
      setError(errorMessage);
      Alert.alert("Connection Error", errorMessage, [
        {
          text: "Retry",
          onPress: () => {
            setRetryCount((prev) => prev + 1);
            loadRooms();
          },
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedBuilding?.id]);

  useFocusEffect(
    useCallback(() => {
      if (selectedBuilding?.id) {
        loadRooms();
      } else {
        Alert.alert("Error", "Please select a building first");
        navigation.goBack();
      }
    }, [selectedBuilding?.id, loadRooms])
  );

  const testConnection = async () => {
    try {
      setLoading(true);
      const isConnected = await api.testConnection();
      if (isConnected) {
        Alert.alert("Success", "Connected to server successfully!", [
          {
            text: "OK",
            onPress: loadRooms,
          },
        ]);
      } else {
        Alert.alert(
          "Connection Error",
          "Could not connect to server. Please check if the server is running.",
          [
            {
              text: "Retry",
              onPress: testConnection,
            },
          ]
        );
      }
    } catch (error) {
      console.error("Connection test error:", error);
      Alert.alert(
        "Error",
        "Failed to test connection. Please check your network settings."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRooms();
  };

  const handleEditRoom = (room: Room) => {
    navigation.navigate("EditRoom", { room });
  };

  const handleDeleteRoom = async (roomId: string) => {
    Alert.alert("Delete Room", "Are you sure you want to delete this room?", [
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
            await roomService.deleteRoom(selectedBuilding.id, roomId);
            loadRooms(); // Refresh the list
            Alert.alert("Success", "Room deleted successfully");
          } catch (error: any) {
            const backendError =
              error.response?.data?.error ||
              error.response?.data?.message ||
              error.message ||
              "Failed to delete room";
            if (
              error.response?.status === 409 &&
              backendError.includes(
                "The room is occupied; you cannot delete it until it is vacant"
              )
            ) {
              Alert.alert(
                "Room Occupied",
                "This room is currently occupied. Please deactivate the tenant first before deleting the room.",
                [{ text: "OK" }]
              );
            } else {
              Alert.alert("Error", backendError);
            }
          }
        },
      },
    ]);
  };

  const handleMoreOptions = (room: Room) => {
    setSelectedRoom(room);
    const options = [
      {
        text: "Edit",
        onPress: () => handleEditRoom(room),
      },
      {
        text: "Delete",
        onPress: () => handleDeleteRoom(room.id?.toString() || ""),
        style: "destructive" as "destructive",
      },
      {
        text: "Cancel",
        style: "cancel" as "cancel",
      },
    ];
    Alert.alert("Room Actions", "Choose an action", options);
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderRoomItem = ({ item }: { item: Room }) => (
    <Card style={styles.roomCard}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Feather name="home" size={36} color={theme.colors.primary} />
        </View>
        <View style={styles.statusBadgeWrapper}>
          <Text
            style={[
              styles.statusBadge,
              item.occupied ? styles.statusOccupied : styles.statusVacant,
            ]}
          >
            {item.occupied ? "Occupied" : "Vacant"}
          </Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.roomName}>{item.roomName}</Text>
        {item.description && (
          <Text style={styles.roomDetailsAccent}>{item.description}</Text>
        )}
        <Text style={styles.roomDetails}>Rent: ${item.rentAmount}</Text>
        <Text style={styles.roomDetails}>
          Status: {item.active ? "Active" : "Inactive"}
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
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color={theme.colors.error} />
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.apiUrl}>API URL: {roomService.getBaseUrl()}</Text>
        <View style={styles.retryButtonRow}>
          <TouchableOpacity style={styles.retryButton} onPress={loadRooms}>
            <Text style={styles.retryButtonText}>Retry Connection</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.retryButton} onPress={testConnection}>
            <Text style={styles.retryButtonText}>Test Connection</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={theme.colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search rooms..."
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredRooms}
        renderItem={renderRoomItem}
        keyExtractor={(item) => item.id?.toString() || item.roomName}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Feather name="home" size={48} color={theme.colors.primary} />
            <Text style={styles.noRoomsText}>No rooms found</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  errorTitle: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    color: theme.colors.error,
  },
  errorText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  apiUrl: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  retryButtonRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.sm,
  },
  retryButtonText: {
    color: theme.colors.card,
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
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
  statusOccupied: {
    backgroundColor: theme.colors.warning || "#FFA500", // Orange for occupied
  },
  statusVacant: {
    backgroundColor: theme.colors.success || "#4CAF50", // Green for vacant
  },
  roomCard: {
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
  roomName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  roomCode: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    fontWeight: "500",
  },
  roomDetailsAccent: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.info,
    marginBottom: theme.spacing.xs,
    fontWeight: "600",
  },
  roomDetails: {
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
  noRoomsText: {
    textAlign: "center",
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.lg,
    marginTop: theme.spacing.md,
    fontWeight: "600",
  },
});

export default RoomListScreen;
