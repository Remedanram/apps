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
import { Tenant } from "../services/tenantService";
import tenantService from "../services/tenantService";
import theme from "../constants/theme";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "EditTenant">;
  route: RouteProp<RootStackParamList, "EditTenant">;
};

const EditTenantScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props["navigation"]>();
  const route = useRoute<Props["route"]>();
  const { tenant } = route.params;

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
      };

      await tenantService.updateTenant(tenant.room.roomName, updatedTenant);
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
      <View style={styles.form}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter tenant name"
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email address (optional)"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Move-in Date</Text>
        <TextInput
          style={styles.input}
          value={moveInDate}
          onChangeText={setMoveInDate}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Move-out Date</Text>
        <TextInput
          style={styles.input}
          value={moveOutDate}
          onChangeText={setMoveOutDate}
          placeholder="YYYY-MM-DD (optional)"
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Updating..." : "Update Tenant"}
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

export default EditTenantScreen;
