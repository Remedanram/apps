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
import { RootStackParamList } from "../navigation/AppNavigator";
import { Room } from "../types/room";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AddTenant">;
};

const AddTenantScreen = ({ navigation }: Props) => {
  const [tenantData, setTenantData] = useState({
    name: "",
    phone: "",
    email: "",
    roomName: "",
    description: "",
  });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const roomsList = await roomService.getAllRooms();
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
    if (!tenantData.name || !tenantData.phone || !tenantData.roomName) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (tenantData.email && !emailRegex.test(tenantData.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      await tenantService.createTenant(tenantData);
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
        <Text style={styles.title}>Add New Tenant</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={tenantData.name}
            onChangeText={(text) =>
              setTenantData({ ...tenantData, name: text })
            }
            placeholder="Enter tenant's full name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={tenantData.phone}
            onChangeText={(text) =>
              setTenantData({ ...tenantData, phone: text })
            }
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={tenantData.email}
            onChangeText={(text) =>
              setTenantData({ ...tenantData, email: text })
            }
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
            value={tenantData.description}
            onChangeText={(text) =>
              setTenantData({ ...tenantData, description: text })
            }
            placeholder="Enter tenant description"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Select Room *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tenantData.roomName}
              onValueChange={(itemValue) =>
                setTenantData({ ...tenantData, roomName: itemValue })
              }
              enabled={!loading}
            >
              <Picker.Item label="Select a vacant room" value="" />
              {rooms.map((room) => (
                <Picker.Item
                  key={room.roomName}
                  label={`${room.roomName} - $${room.rentAmount}`}
                  value={room.roomName}
                />
              ))}
            </Picker>
          </View>
          {rooms.length === 0 && !loading && (
            <Text style={styles.noRoomsText}>No vacant rooms available</Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (loading || rooms.length === 0) && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={loading || rooms.length === 0}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Loading Rooms..." : "Add Tenant"}
          </Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  formCard: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "bold",
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: theme.typography.sizes.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pickerContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  disabledButton: {
    backgroundColor: theme.colors.text.secondary,
    opacity: 0.7,
  },
  submitButtonText: {
    color: theme.colors.card,
    fontSize: theme.typography.sizes.md,
    fontWeight: "500",
  },
  noRoomsText: {
    color: theme.colors.error,
    fontSize: theme.typography.sizes.sm,
    marginTop: theme.spacing.xs,
    fontStyle: "italic",
  },
});

export default AddTenantScreen;
