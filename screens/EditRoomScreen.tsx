import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { Room } from "../types/room";
import roomService from "../services/roomService";
import theme from "../constants/theme";
import { useBuilding } from "../contexts/BuildingContext";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "EditRoom">;
  route: RouteProp<RootStackParamList, "EditRoom">;
};

const EditRoomScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props["navigation"]>();
  const route = useRoute<Props["route"]>();
  const { room } = route.params;
  const { selectedBuilding } = useBuilding();

  const [roomName, setRoomName] = useState(room.roomName);
  const [description, setDescription] = useState(room.description || "");
  const [rentAmount, setRentAmount] = useState(room.rentAmount.toString());
  const [active, setActive] = useState(room.active);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!roomName || !rentAmount) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!selectedBuilding?.id) {
      Alert.alert("Error", "No building selected");
      return;
    }

    try {
      setLoading(true);

      const updatedRoom = {
        roomName,
        rentAmount: parseFloat(rentAmount),
        description: description || "",
        buildingId: selectedBuilding.id,
      };

      console.log("Submitting room update:", {
        roomName: room.roomName,
        updatedRoom,
      });

      await roomService.updateRoom(
        selectedBuilding.id,
        String(room.id),
        updatedRoom
      );

      Alert.alert("Success", "Room updated successfully");
      navigation.goBack();
    } catch (error: any) {
      console.error("Error updating room:", error);
      const backendError =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update room";
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
      <View style={styles.form}>
        <Text style={styles.label}>Room Name *</Text>
        <TextInput
          style={styles.input}
          value={roomName}
          onChangeText={setRoomName}
          placeholder="Enter room name"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter room description"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Rent Amount *</Text>
        <TextInput
          style={styles.input}
          value={rentAmount}
          onChangeText={setRentAmount}
          placeholder="Enter rent amount"
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[
            styles.button,
            active ? styles.activeButton : styles.inactiveButton,
          ]}
          onPress={() => setActive(!active)}
        >
          <Text style={styles.buttonText}>
            {active ? "Active" : "Inactive"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Updating..." : "Update Room"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  form: {
    padding: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: theme.colors.success,
  },
  inactiveButton: {
    backgroundColor: theme.colors.error,
  },
  buttonText: {
    color: theme.colors.card,
    fontSize: theme.typography.sizes.sm,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: theme.colors.card,
    fontSize: theme.typography.sizes.md,
    fontWeight: "500",
  },
});

export default EditRoomScreen;
