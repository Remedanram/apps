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
import tenantService, { Tenant } from "../services/tenantService";
import roomService from "../services/roomService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import { Picker } from "@react-native-picker/picker";
import { Room } from "../types/room";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "EditTenant">;
  route: RouteProp<RootStackParamList, "EditTenant">;
};

const EditTenantScreen: React.FC<Props> = ({ navigation, route }) => {
  const { tenant } = route.params;
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantData, setTenantData] = useState({
    name: tenant.name,
    phone: tenant.phone,
    roomName: tenant.room.roomName,
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const roomsList = await roomService.getAllRooms();
      setRooms(roomsList);
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

    try {
      await tenantService.updateTenant(tenant.id, tenantData);
      Alert.alert("Success", "Tenant updated successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update tenant. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.formCard}>
        <Text style={styles.title}>Edit Tenant</Text>

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
          <Text style={styles.label}>Select Room *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tenantData.roomName}
              onValueChange={(itemValue) =>
                setTenantData({ ...tenantData, roomName: itemValue })
              }
              enabled={!loading}
            >
              <Picker.Item label="Select a room" value="" />
              {rooms.map((room) => (
                <Picker.Item
                  key={room.roomName}
                  label={`${room.roomName} - $${room.rentAmount}`}
                  value={room.roomName}
                />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Loading Rooms..." : "Update Tenant"}
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
  },
  formCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "bold",
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
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
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  pickerContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: theme.colors.card,
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
  },
});

export default EditTenantScreen;
