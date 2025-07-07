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
import { validateOtp } from "../services/authService";
import theme from "../constants/theme";
import { NavigationProp, RootStackParamList } from "../types/navigation";

type OtpRouteProp = RouteProp<RootStackParamList, "OtpVerification">;

const OtpVerificationScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OtpRouteProp>();
  const { email } = route.params;
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      Alert.alert("Validation Error", "Please enter the OTP code.");
      return;
    }
    setLoading(true);
    try {
      await validateOtp(email, otpCode);
      Alert.alert(
        "OTP Verified",
        "OTP is valid. You may now set a new password.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("ResetPassword", { email, otpCode }),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Invalid OTP.");
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
        <Text style={styles.title}>OTP Verification</Text>
        <Text style={styles.subtitle}>Enter the OTP sent to your email.</Text>
        <View style={styles.inputContainer}>
          <Feather name="key" size={20} color={theme.colors.text.secondary} />
          <TextInput
            style={styles.input}
            placeholder="OTP Code"
            value={otpCode}
            onChangeText={setOtpCode}
            keyboardType="number-pad"
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleVerifyOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Verify OTP</Text>
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

export default OtpVerificationScreen;
