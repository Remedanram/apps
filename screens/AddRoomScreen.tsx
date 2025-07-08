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
import { Feather } from "@expo/vector-icons";

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.headerIconCircle}>
          <Feather name="home" size={32} color={theme.colors.card} />
        </View>
        <Text style={styles.headerTitle}>Add New Room</Text>
      </View>
      <Card style={styles.formCard}>
        <View style={styles.inputGroupRow}>
          <Feather
            name="tag"
            size={20}
            color={theme.colors.primary}
            style={styles.inputIcon}
          />
          <View style={{ flex: 1 }}>
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
        </View>

        <View style={styles.inputGroupRow}>
          <Feather
            name="dollar-sign"
            size={20}
            color={theme.colors.primary}
            style={styles.inputIcon}
          />
          <View style={{ flex: 1 }}>
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
        </View>

        <View style={styles.inputGroupRow}>
          <Feather
            name="file-text"
            size={20}
            color={theme.colors.primary}
            style={styles.inputIcon}
          />
          <View style={{ flex: 1 }}>
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
  headerSection: {
    alignItems: "center",
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  headerIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  formCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.card,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroupRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    shadowColor: theme.shadows.small.shadowColor,
    shadowOffset: theme.shadows.small.shadowOffset,
    shadowOpacity: theme.shadows.small.shadowOpacity,
    shadowRadius: theme.shadows.small.shadowRadius,
    elevation: theme.shadows.small.elevation,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
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
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    alignItems: "center",
    marginTop: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: theme.colors.card,
    fontSize: theme.typography.sizes.lg,
    fontWeight: "700",
    letterSpacing: 1,
  },
});

export default AddRoomScreen;
