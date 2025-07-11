import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import theme from "../constants/theme";
import authService from "../services/authService";
import buildingService from "../services/buildingService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useBuilding } from "../contexts/BuildingContext";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Auth">;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { selectedBuilding, setSelectedBuilding } = useBuilding();
  const [billerCode, setBillerCode] = useState("");

  const handleAuth = async () => {
    if (isLogin) {
      if (!email || !password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }
    } else {
      if (!name || !email || !password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }
    }

    setLoading(true);
    try {
      let response;
      if (isLogin) {
        response = await authService.login({ email, password });
        console.log("Login response received:", response);

        if (!response?.token) {
          throw new Error("No token received from server");
        }

        // Store auth data
        await AsyncStorage.setItem("userToken", response.token);
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify({
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
          })
        );

        // Check if user has buildings
        try {
          const buildings = await buildingService.getAllBuildings();
          console.log("Buildings fetched:", buildings);

          if (buildings.length === 0) {
            // No buildings exist - force user to create one
            Alert.alert(
              "No Buildings Found",
              "You need to create your first building to continue.",
              [
                {
                  text: "Create Building",
                  onPress: () => {
                    // Navigate to building creation
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "BuildingSelection" }],
                    });
                  },
                },
              ]
            );
            return;
          } else if (buildings.length === 1) {
            // Only one building - auto-select it
            const building = buildings[0];
            await setSelectedBuilding(building);
            console.log("Auto-selected building:", building);

            // Navigate directly to main screen
            navigation.reset({
              index: 0,
              routes: [{ name: "Main" }],
            });
          } else {
            // Multiple buildings - let user select
            console.log("Multiple buildings found, navigating to selection");
            navigation.reset({
              index: 0,
              routes: [{ name: "BuildingSelection" }],
            });
          }
        } catch (buildingError) {
          console.error("Error fetching buildings:", buildingError);
          Alert.alert("Error", "Failed to load buildings. Please try again.");
        }
      } else {
        // SIGNUP FLOW
        response = await authService.signup({
          name,
          email,
          password,
          billerCode,
        });
        console.log("Signup response received:", response);

        // After successful signup, automatically login to get token
        try {
          const loginResponse = await authService.login({ email, password });
          console.log("Auto-login response:", loginResponse);

          if (!loginResponse?.token) {
            throw new Error("No token received after auto-login");
          }

          // Store auth data
          await AsyncStorage.setItem("userToken", loginResponse.token);
          await AsyncStorage.setItem(
            "userData",
            JSON.stringify({
              id: loginResponse.user.id,
              name: loginResponse.user.name,
              email: loginResponse.user.email,
            })
          );

          // Mark as new user for building creation flow
          await AsyncStorage.setItem("isNewUser", "true");

          // After successful signup and auto-login, automatically create first building
          Alert.alert(
            "Account Created Successfully!",
            "Now let's create your first building to get started.",
            [
              {
                text: "Create Building",
                onPress: () => {
                  // Navigate to building creation
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "BuildingSelection" }],
                  });
                },
              },
            ]
          );
        } catch (loginError: any) {
          console.error("Auto-login error:", loginError);
          // If auto-login fails, show success message and ask user to login manually
          Alert.alert(
            "Account Created Successfully!",
            "Your account has been created. Please login to continue.",
            [
              {
                text: "OK",
                onPress: () => {
                  setIsLogin(true);
                  setPassword(""); // Clear password for manual login
                },
              },
            ]
          );
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Coming Soon",
      "Forgot Password feature will be available in a future update.",
      [{ text: "OK" }]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Feather name="home" size={40} color={theme.colors.primary} />
            <Text style={styles.title}>Rent Controller</Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? "Login to manage your properties"
                : "Create your account"}
            </Text>
          </View>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Feather
                name="user"
                size={20}
                color={theme.colors.text.secondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          )}

          {/* Biller Code input for signup */}
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Feather
                name="credit-card"
                size={20}
                color={theme.colors.text.secondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Biller Code"
                value={billerCode}
                onChangeText={setBillerCode}
                autoCapitalize="characters"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Feather
              name="mail"
              size={20}
              color={theme.colors.text.secondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather
              name="lock"
              size={20}
              color={theme.colors.text.secondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
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

          {isLogin && (
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.card} />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? "Login" : "Sign Up"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchButtonText}>
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
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
  scrollContainer: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: "700",
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.small,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  eyeIcon: {
    padding: theme.spacing.sm,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: "center",
    marginTop: theme.spacing.md,
    ...theme.shadows.small,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
  },
  switchButton: {
    marginTop: theme.spacing.md,
    alignItems: "center",
  },
  switchButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.md,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.sm,
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
