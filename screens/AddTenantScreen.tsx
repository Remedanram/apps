import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Text } from "react-native";
import { Card } from "../components";
import theme from "../constants/theme";
import { Picker } from "@react-native-picker/picker";
import tenantService from "../services/tenantService";
import roomService from "../services/roomService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { Room } from "../types/room";
import { useBuilding } from "../contexts/BuildingContext";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AddTenant">;
};

const AddTenantScreen = ({ navigation }: Props) => {
  const { selectedBuilding } = useBuilding();
  const [tenantData, setTenantData] = useState({
    name: "",
    phone: "",
    email: "",
    description: "",
    moveInDate: new Date().toISOString().split("T")[0],
  });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedBuilding?.id) {
      fetchRooms();
    } else {
      setRooms([]);
      setLoading(false);
    }
  }, [selectedBuilding]);

  const fetchRooms = async () => {
    try {
      if (!selectedBuilding?.id) return;
      const roomsList = await roomService.getAllRooms(selectedBuilding.id);
      // Filter only vacant and active rooms
      const vacantRooms = roomsList.filter(
        (room) => !room.occupied && room.active
      );
      setRooms(vacantRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      Alert.alert("Error", "Failed to load rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !tenantData.name ||
      !tenantData.phone ||
      !selectedRoomId ||
      !selectedBuilding?.id
    ) {
      Alert.alert(
        "Error",
        "Please fill in all required fields and select a room"
      );
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (tenantData.email && !emailRegex.test(tenantData.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      await tenantService.createTenant(
        selectedBuilding.id,
        selectedRoomId,
        tenantData
      );
      Alert.alert("Success", "Tenant added successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to add tenant. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Room *</Text>
          <Picker
            selectedValue={selectedRoomId}
            onValueChange={(value) => setSelectedRoomId(value)}
            style={styles.picker}
          >
            <Picker.Item label="Select a room" value="" />
            {rooms.map((room) => (
              <Picker.Item
                key={room.id}
                label={`${room.roomName} - $${room.rentAmount}`}
                value={room.id?.toString()}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={tenantData.name}
            onChangeText={(text) =>
              setTenantData({ ...tenantData, name: text })
            }
            placeholder="Enter tenant name"
            placeholderTextColor={theme.colors.text.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={styles.input}
            value={tenantData.phone}
            onChangeText={(text) =>
              setTenantData({ ...tenantData, phone: text })
            }
            placeholder="Enter phone number"
            placeholderTextColor={theme.colors.text.secondary}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={tenantData.email}
            onChangeText={(text) =>
              setTenantData({ ...tenantData, email: text })
            }
            placeholder="Enter email address"
            placeholderTextColor={theme.colors.text.secondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Move-in Date</Text>
          <TextInput
            style={styles.input}
            value={tenantData.moveInDate}
            onChangeText={(text) =>
              setTenantData({ ...tenantData, moveInDate: text })
            }
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.text.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={tenantData.description}
            onChangeText={(text) =>
              setTenantData({ ...tenantData, description: text })
            }
            placeholder="Enter tenant description"
            placeholderTextColor={theme.colors.text.secondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add Tenant</Text>
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
  picker: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
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
  submitButtonText: {
    color: theme.colors.card,
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
  },
});

export default AddTenantScreen;
