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
import type { Tenant } from "../types/tenant";
import tenantService from "../services/tenantService";
import theme from "../constants/theme";
import { Feather } from "@expo/vector-icons";
import { Card } from "../components";
import { useBuilding } from "../contexts/BuildingContext";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "EditTenant">;
  route: RouteProp<RootStackParamList, "EditTenant">;
};

const EditTenantScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props["navigation"]>();
  const route = useRoute<Props["route"]>();
  const { tenant } = route.params;
  const { selectedBuilding } = useBuilding();

  const [name, setName] = useState(tenant.name);
  const [moveInDate, setMoveInDate] = useState(
    tenant.moveInDate
      ? new Date(tenant.moveInDate).toISOString().split("T")[0]
      : ""
  );
  const [moveOutDate, setMoveOutDate] = useState(
    tenant.moveOutDate
      ? new Date(tenant.moveOutDate).toISOString().split("T")[0]
      : ""
  );
  const [phone, setPhone] = useState(tenant.phone);
  const [email, setEmail] = useState(tenant.email || "");
  const [description, setDescription] = useState(tenant.description || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const updatedTenant: Partial<Tenant> = {
        name,
        moveInDate,
        moveOutDate: moveOutDate || "",
        phone,
        email,
        description,
      };

      if (!selectedBuilding?.id) {
        Alert.alert("Error", "No building selected");
        return;
      }
      await tenantService.updateTenant(
        selectedBuilding.id,
        tenant.room.id,
        updatedTenant
      );
      Alert.alert("Success", "Tenant updated successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating tenant:", error);
      Alert.alert("Error", "Failed to update tenant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.headerIconCircle}>
          <Feather name="user-check" size={32} color={theme.colors.card} />
        </View>
        <Text style={styles.headerTitle}>Edit Tenant</Text>
      </View>
      <Card style={styles.formCard}>
        <View style={styles.inputGroupRow}>
          <Feather
            name="user"
            size={20}
            color={theme.colors.primary}
            style={styles.inputIcon}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter tenant name"
              placeholderTextColor={theme.colors.text.secondary}
            />
          </View>
        </View>

        <View style={styles.inputGroupRow}>
          <Feather
            name="phone"
            size={20}
            color={theme.colors.primary}
            style={styles.inputIcon}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              placeholderTextColor={theme.colors.text.secondary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroupRow}>
          <Feather
            name="mail"
            size={20}
            color={theme.colors.primary}
            style={styles.inputIcon}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address (optional)"
              placeholderTextColor={theme.colors.text.secondary}
              keyboardType="email-address"
              autoCapitalize="none"
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
              placeholder="Enter tenant description"
              placeholderTextColor={theme.colors.text.secondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.inputGroupRow}>
          <Feather
            name="calendar"
            size={20}
            color={theme.colors.primary}
            style={styles.inputIcon}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Move-in Date</Text>
            <TextInput
              style={styles.input}
              value={moveInDate}
              onChangeText={setMoveInDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.text.secondary}
            />
          </View>
        </View>

        <View style={styles.inputGroupRow}>
          <Feather
            name="calendar"
            size={20}
            color={theme.colors.primary}
            style={styles.inputIcon}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Move-out Date</Text>
            <TextInput
              style={styles.input}
              value={moveOutDate}
              onChangeText={setMoveOutDate}
              placeholder="YYYY-MM-DD (optional)"
              placeholderTextColor={theme.colors.text.secondary}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Updating..." : "Update Tenant"}
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
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: theme.colors.card,
    fontSize: theme.typography.sizes.md,
    fontWeight: "500",
  },
});

export default EditTenantScreen;
