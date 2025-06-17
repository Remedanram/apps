import React, { useState, useEffect } from "react";
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

  const loadRooms = async () => {
    try {
      setError(null);
      if (!selectedBuilding?.id) return;
      const response = await roomService.getAllRooms(selectedBuilding.id);
      console.log("API Response:", response);
      setRooms(Array.isArray(response) ? response : []);
      setRetryCount(0); // Reset retry count on success
    } catch (error: any) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      let errorMessage = "Failed to load rooms";

      if (error.message.includes("timeout")) {
        errorMessage =
          "Server is taking too long to respond. Please check your connection and try again.";
      } else if (error.message.includes("Network request failed")) {
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
        {
          text: "Test Connection",
          onPress: testConnection,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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

  useEffect(() => {
    if (selectedBuilding?.id) {
      loadRooms();
    } else {
      Alert.alert("Error", "Please select a building first");
      navigation.goBack();
    }
  }, [selectedBuilding]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRooms();
  };

  const handleEditRoom = (room: Room) => {
    navigation.navigate("EditRoom", { room });
  };

  const handleDeleteRoom = async (roomName: string) => {
    try {
      if (!selectedBuilding?.id) return;
      await roomService.deleteRoom(selectedBuilding.id, roomName);
      loadRooms(); // Refresh the list
      Alert.alert("Success", "Room deleted successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to delete room");
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderRoomItem = ({ item }: { item: Room }) => (
    <Card style={styles.roomCard}>
      <View style={styles.roomHeader}>
        <Text style={styles.roomNumber}>{item.roomName}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: item.occupied
                ? theme.colors.status.pending
                : theme.colors.status.paid,
            },
          ]}
        >
          <Text style={styles.statusText}>
            {item.occupied ? "Occupied" : "Vacant"}
          </Text>
        </View>
      </View>
      {item.description && (
        <View style={styles.roomDetails}>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value}>{item.description}</Text>
        </View>
      )}
      <View style={styles.roomDetails}>
        <Text style={styles.label}>Rent:</Text>
        <Text style={styles.value}>${item.rentAmount}</Text>
      </View>
      <View style={styles.roomDetails}>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{item.active ? "Active" : "Inactive"}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditRoom(item)}
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
          onPress={() => handleDeleteRoom(item.roomName)}
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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Connecting to API...</Text>
        <Text style={styles.apiUrl}>API URL: {roomService.getBaseUrl()}</Text>
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
        <View style={styles.errorButtons}>
          <TouchableOpacity style={styles.retryButton} onPress={loadRooms}>
            <Text style={styles.retryButtonText}>Retry Connection</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.retryButton, styles.testButton]}
            onPress={testConnection}
          >
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
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredRooms}
        renderItem={renderRoomItem}
        keyExtractor={(item) => item.id?.toString() || item.roomName}
        contentContainerStyle={styles.listContainer}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No rooms found</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  apiUrl: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    textAlign: "center",
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
  retryButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
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
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.sizes.md,
  },
  listContainer: {
    gap: theme.spacing.md,
  },
  emptyContainer: {
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  roomCard: {
    padding: theme.spacing.md,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  roomNumber: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    color: theme.colors.card,
    fontSize: theme.typography.sizes.sm,
    fontWeight: "500",
  },
  roomDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.xs,
  },
  label: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.md,
  },
  value: {
    fontSize: theme.typography.sizes.md,
    fontWeight: "500",
  },
  errorButtons: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  testButton: {
    backgroundColor: theme.colors.secondary,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
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

export default RoomListScreen;
