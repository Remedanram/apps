import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { resetPasswordOtp } from "../services/authService";
import theme from "../constants/theme";
import { NavigationProp, RootStackParamList } from "../types/navigation";

type ResetRouteProp = RouteProp<RootStackParamList, "ResetPassword">;

const ResetPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ResetRouteProp>();
  const { email, otpCode } = route.params;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert(
        "Validation Error",
        "Please enter and confirm your new password."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert(
        "Validation Error",
        "Password must be at least 6 characters."
      );
      return;
    }
    setLoading(true);
    try {
      await resetPasswordOtp(email, otpCode, newPassword);
      Alert.alert(
        "Success",
        "Your password has been reset. You can now log in.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.reset({ index: 0, routes: [{ name: "Auth" }] }),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your new password below.</Text>
        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color={theme.colors.text.secondary} />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color={theme.colors.text.secondary} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Reset Password</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
  },
  content: { padding: 24 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  eyeIcon: { padding: 8 },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  backButton: { alignItems: "center", marginTop: 8 },
  backButtonText: { color: theme.colors.primary, fontSize: 16 },
});

export default ResetPasswordScreen;
