import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
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
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userData");
            navigation.reset({
              index: 0,
              routes: [{ name: "Auth" as never }],
            });
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
    showBadge?: boolean
  ) => (
    <TouchableOpacity onPress={onPress}>
      <Card variant="outlined" style={styles.settingCard}>
        <View style={styles.settingContent}>
          <View style={styles.settingLeft}>
            <View style={styles.iconContainer}>
              <Feather name={icon} size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.settingTitle}>{title}</Text>
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
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {renderSettingItem("user", "Profile Settings", () =>
          navigation.navigate("Profile")
        )}
        {renderSettingItem("bell", "Notifications", () => {}, true)}
        {renderSettingItem("lock", "Security", () => {})}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        {renderSettingItem("globe", "Language", () => {})}
        {renderSettingItem("moon", "Dark Mode", () => {})}
        {renderSettingItem("dollar-sign", "Currency", () => {})}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        {renderSettingItem("help-circle", "Help Center", () => {})}
        {renderSettingItem("mail", "Contact Us", () => {})}
        {renderSettingItem("info", "About", () => {})}
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Feather name="log-out" size={20} color={theme.colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
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
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.danger + "10",
    borderRadius: theme.borderRadius.md,
    marginTop: "auto",
  },
  logoutText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
    color: theme.colors.danger,
  },
});

export default SettingsScreen;
