import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Button,
} from "react-native";
import { Text } from "react-native";
import { Card } from "../components";
import theme from "../constants/theme";
import roomService from "../services/roomService";
import type { CreateRoomRequest } from "../types/room";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import api from "../services/api";
import { useBuilding } from "../contexts/BuildingContext";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AddRoom">;
};

const AddRoomScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedBuilding } = useBuilding();
  const [loading, setLoading] = useState(false);
  const [roomData, setRoomData] = useState<CreateRoomRequest>({
    roomName: "",
    rentAmount: 0,
    description: "",
    buildingId: selectedBuilding?.id || "",
  });
  const [rentAmountText, setRentAmountText] = useState("");

  useEffect(() => {
    if (selectedBuilding?.id) {
      setRoomData((prev) => ({ ...prev, buildingId: selectedBuilding.id }));
    }
  }, [selectedBuilding]);

  const handleSubmit = async () => {
    if (!roomData.roomName || !rentAmountText || !roomData.buildingId) {
      Alert.alert(
        "Error",
        "Please fill in all required fields and ensure a building is selected"
      );
      return;
    }

    setLoading(true);
    try {
      const dataToSubmit = {
        ...roomData,
        rentAmount: parseFloat(rentAmountText),
      };

      await roomService.createRoom(roomData.buildingId, dataToSubmit);
      Alert.alert("Success", "Room added successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error("Error creating room:", error);
      const backendError =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to create room";
      if (
        error.response?.status === 409 &&
        backendError.includes("Room name already exists")
      ) {
        Alert.alert(
          "Room Name Exists",
          "A room with this name already exists in this building. Please choose a different name.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", backendError);
      }
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const baseUrl = api.getBaseUrl();
      console.log("Testing connection to:", baseUrl);

      const response = await api.testConnection();
      if (response) {
        Alert.alert("Success", "Connected to server successfully!");
      } else {
        Alert.alert("Error", "Could not connect to server");
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Connection test error:", err);
      Alert.alert("Error", `Connection test failed: ${err.message}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Button title="Test Connection" onPress={testConnection} />
      <Card style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Room Name *</Text>
          <TextInput
            style={styles.input}
            value={roomData.roomName}
            onChangeText={(text) =>
              setRoomData({ ...roomData, roomName: text })
            }
            placeholder="Enter room name"
            placeholderTextColor={theme.colors.text.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Rent Amount *</Text>
          <TextInput
            style={styles.input}
            value={rentAmountText}
            onChangeText={(text) => {
              const cleanText = text.replace(/[^0-9.]/g, "");
              setRentAmountText(cleanText);
              setRoomData({
                ...roomData,
                rentAmount: parseFloat(cleanText) || 0,
              });
            }}
            placeholder="Enter rent amount"
            placeholderTextColor={theme.colors.text.secondary}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={roomData.description}
            onChangeText={(text) =>
              setRoomData({ ...roomData, description: text })
            }
            placeholder="Enter room description"
            placeholderTextColor={theme.colors.text.secondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.card} />
          ) : (
            <Text style={styles.submitButtonText}>Add Room</Text>
          )}
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  formCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontWeight: "500",
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: theme.typography.sizes.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: theme.colors.card,
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
  },
});

export default AddRoomScreen;
