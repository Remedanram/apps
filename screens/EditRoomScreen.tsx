import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { Room } from "../types/room";
import roomService from "../services/roomService";
import theme from "../constants/theme";
import { useBuilding } from "../contexts/BuildingContext";
import { Feather } from "@expo/vector-icons";
import { Card } from "../components";

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
      <View style={styles.headerSection}>
        <View style={styles.headerIconCircle}>
          <Feather name="home" size={32} color={theme.colors.card} />
        </View>
        <Text style={styles.headerTitle}>Edit Room</Text>
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
              value={roomName}
              onChangeText={setRoomName}
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
              value={rentAmount}
              onChangeText={setRentAmount}
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
              value={description}
              onChangeText={setDescription}
              placeholder="Enter room description"
              placeholderTextColor={theme.colors.text.secondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.statusButton,
            active ? styles.activeButton : styles.inactiveButton,
          ]}
          onPress={() => setActive(!active)}
        >
          <Text style={styles.statusButtonText}>
            {active ? "Active" : "Inactive"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.card} />
          ) : (
            <Text style={styles.submitButtonText}>Update Room</Text>
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
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  formCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.card,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroupRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  inputIcon: {
    marginTop: theme.spacing.sm,
    marginRight: theme.spacing.md,
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
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  statusButton: {
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
  statusButtonText: {
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
  submitButtonDisabled: {
    opacity: 0.7,
  },
});

export default EditRoomScreen;
