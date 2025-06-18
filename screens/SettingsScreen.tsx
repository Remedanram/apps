import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "../types/navigation";
import Card from "../components/Card";
import theme from "../constants/theme";

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout? You will need to login again.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all stored data
              await AsyncStorage.removeItem("userToken");
              await AsyncStorage.removeItem("userData");
              await AsyncStorage.removeItem("selectedBuildingId");
              await AsyncStorage.removeItem("selectedBuildingName");

              // Navigate to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: "Auth" as never }],
              });
            } catch (error) {
              console.error("Error during logout:", error);
              // Still navigate to login even if clearing storage fails
              navigation.reset({
                index: 0,
                routes: [{ name: "Auth" as never }],
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderSettingItem = (
    icon: keyof typeof Feather.glyphMap,
    title: string,
    onPress: () => void,
    showBadge?: boolean,
    isDestructive?: boolean
  ) => (
    <TouchableOpacity onPress={onPress}>
      <Card variant="outlined" style={styles.settingCard}>
        <View style={styles.settingContent}>
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.iconContainer,
                isDestructive && styles.destructiveIconContainer,
              ]}
            >
              <Feather
                name={icon}
                size={20}
                color={
                  isDestructive ? theme.colors.danger : theme.colors.primary
                }
              />
            </View>
            <Text
              style={[
                styles.settingTitle,
                isDestructive && styles.destructiveText,
              ]}
            >
              {title}
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={20}
            color={theme.colors.text.secondary}
          />
        </View>
        {showBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>New</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {renderSettingItem("user", "Profile Settings", () =>
          navigation.navigate("Profile")
        )}
        {renderSettingItem("bell", "Notifications", () => {}, true)}
        {renderSettingItem("lock", "Security", () =>
          navigation.navigate("ChangePassword")
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        {renderSettingItem("help-circle", "Help Center", () => {})}
        {renderSettingItem("mail", "Contact Us", () => {})}
        {renderSettingItem("info", "About", () => {})}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        {renderSettingItem("log-out", "Logout", handleLogout, false, true)}
      </View>

      {/* Add some bottom padding to ensure logout button is visible */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: "600",
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  settingCard: {
    marginBottom: theme.spacing.xs,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary + "10",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  settingTitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  badge: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.round,
  },
  badgeText: {
    color: "white",
    fontSize: theme.typography.sizes.xs,
    fontWeight: "500",
  },
  destructiveIconContainer: {
    backgroundColor: theme.colors.danger + "10",
  },
  destructiveText: {
    color: theme.colors.danger,
  },
  bottomPadding: {
    height: theme.spacing.xl,
  },
});

export default SettingsScreen;
