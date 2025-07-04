import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NavigationProp } from "../types/navigation";
import { updateProfile, getProfile } from "../services/authService";
import { UserProfile } from "../types/userProfile";
import Card from "../components/Card";
import theme from "../constants/theme";

type EditProfileRouteProp = RouteProp<
  { EditProfile: { profile: UserProfile } },
  "EditProfile"
>;

const EditProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditProfileRouteProp>();
  const { profile } = route.params;

  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    billerCode: profile.billerCode || "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    billerCode?: string;
  }>({});

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; billerCode?: string } =
      {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.billerCode.trim()) {
      newErrors.billerCode = "Biller Code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await updateProfile(profile.id, formData);

      // Fetch the updated profile data
      const updatedProfile = await getProfile();

      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Navigate back with the updated profile data
            navigation.navigate("Profile");
          },
        },
      ]);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel",
      "Are you sure you want to cancel? Your changes will be lost.",
      [
        { text: "Continue Editing", style: "cancel" },
        {
          text: "Cancel",
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Feather
            name="arrow-left"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Card variant="outlined" style={styles.formCard}>
            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Feather name="user" size={20} color={theme.colors.primary} />
                <Text style={styles.inputLabel}>Full Name</Text>
              </View>
              <TextInput
                style={[styles.textInput, errors.name && styles.textInputError]}
                value={formData.name}
                onChangeText={(text) => updateField("name", text)}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.text.secondary}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Feather name="mail" size={20} color={theme.colors.primary} />
                <Text style={styles.inputLabel}>Email Address</Text>
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  errors.email && styles.textInputError,
                ]}
                value={formData.email}
                onChangeText={(text) => updateField("email", text)}
                placeholder="Enter your email address"
                placeholderTextColor={theme.colors.text.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Feather
                  name="credit-card"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.inputLabel}>Biller Code</Text>
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  errors.billerCode && styles.textInputError,
                ]}
                value={formData.billerCode}
                onChangeText={(text) => updateField("billerCode", text)}
                placeholder="Enter your biller code"
                placeholderTextColor={theme.colors.text.secondary}
                autoCapitalize="characters"
              />
              {errors.billerCode && (
                <Text style={styles.errorText}>{errors.billerCode}</Text>
              )}
            </View>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    color: theme.colors.text.primary,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.text.secondary,
  },
  saveButtonText: {
    color: "white",
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  formSection: {
    padding: theme.spacing.md,
  },
  formCard: {
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  inputLabel: {
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  textInput: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  textInputError: {
    borderColor: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.sizes.sm,
    marginTop: theme.spacing.xs,
  },
});

export default EditProfileScreen;
