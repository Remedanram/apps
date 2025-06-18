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
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "../types/navigation";
import { changePassword } from "../services/authService";
import Card from "../components/Card";
import theme from "../constants/theme";

const ChangePasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const validateForm = () => {
    const newErrors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      Alert.alert("Success", "Password changed successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error changing password:", error);
      Alert.alert(
        "Error",
        "Failed to change password. Please check your current password and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (
      formData.currentPassword ||
      formData.newPassword ||
      formData.confirmPassword
    ) {
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
    } else {
      navigation.goBack();
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
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
        <Text style={styles.headerTitle}>Change Password</Text>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleChangePassword}
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
                <Feather name="lock" size={20} color={theme.colors.primary} />
                <Text style={styles.inputLabel}>Current Password</Text>
              </View>
              <View
                style={[
                  styles.passwordInput,
                  errors.currentPassword && styles.textInputError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  value={formData.currentPassword}
                  onChangeText={(text) => updateField("currentPassword", text)}
                  placeholder="Enter your current password"
                  placeholderTextColor={theme.colors.text.secondary}
                  secureTextEntry={!showPasswords.current}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => togglePasswordVisibility("current")}
                >
                  <Feather
                    name={showPasswords.current ? "eye-off" : "eye"}
                    size={20}
                    color={theme.colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.currentPassword && (
                <Text style={styles.errorText}>{errors.currentPassword}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Feather name="key" size={20} color={theme.colors.primary} />
                <Text style={styles.inputLabel}>New Password</Text>
              </View>
              <View
                style={[
                  styles.passwordInput,
                  errors.newPassword && styles.textInputError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  value={formData.newPassword}
                  onChangeText={(text) => updateField("newPassword", text)}
                  placeholder="Enter your new password"
                  placeholderTextColor={theme.colors.text.secondary}
                  secureTextEntry={!showPasswords.new}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => togglePasswordVisibility("new")}
                >
                  <Feather
                    name={showPasswords.new ? "eye-off" : "eye"}
                    size={20}
                    color={theme.colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.newPassword && (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Feather
                  name="check-circle"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.inputLabel}>Confirm New Password</Text>
              </View>
              <View
                style={[
                  styles.passwordInput,
                  errors.confirmPassword && styles.textInputError,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateField("confirmPassword", text)}
                  placeholder="Confirm your new password"
                  placeholderTextColor={theme.colors.text.secondary}
                  secureTextEntry={!showPasswords.confirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => togglePasswordVisibility("confirm")}
                >
                  <Feather
                    name={showPasswords.confirm ? "eye-off" : "eye"}
                    size={20}
                    color={theme.colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>
          </Card>
        </View>

        <View style={styles.infoSection}>
          <Card variant="outlined" style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Feather name="info" size={20} color={theme.colors.primary} />
              <Text style={styles.infoTitle}>Password Requirements</Text>
            </View>
            <Text style={styles.infoText}>
              • Password must be at least 6 characters long
            </Text>
            <Text style={styles.infoText}>
              • New password must be different from current password
            </Text>
            <Text style={styles.infoText}>
              • Make sure to remember your new password
            </Text>
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
  passwordInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  textInput: {
    flex: 1,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  textInputError: {
    borderColor: theme.colors.danger,
  },
  eyeIcon: {
    padding: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.sizes.sm,
    marginTop: theme.spacing.xs,
  },
  infoSection: {
    padding: theme.spacing.md,
  },
  infoCard: {
    marginBottom: theme.spacing.md,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  infoTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
});

export default ChangePasswordScreen;
