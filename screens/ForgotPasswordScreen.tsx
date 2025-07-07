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
import { useNavigation } from "@react-navigation/native";
import { forgotPasswordOtp } from "../services/authService";
import theme from "../constants/theme";
import { NavigationProp } from "../types/navigation";

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await forgotPasswordOtp(email);
      Alert.alert("OTP Sent", "An OTP has been sent to your email.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("OtpVerification", { email }),
        },
      ]);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to send OTP.";
      // Only show user-friendly alert, do not log raw error to console
      Alert.alert("Error", msg);
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
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email to receive an OTP for password reset.
        </Text>
        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color={theme.colors.text.secondary} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleRequestOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Send OTP</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
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

export default ForgotPasswordScreen;
