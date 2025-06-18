import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import theme from "../constants/theme";
import buildingService, {
  CreateBuildingRequest,
} from "../services/buildingService";

interface Props {
  visible: boolean;
  onClose: () => void;
  onBuildingAdded: () => void;
  isNewUser?: boolean;
}

const AddBuildingModal: React.FC<Props> = ({
  visible,
  onClose,
  onBuildingAdded,
  isNewUser = false,
}) => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [billerCode, setBillerCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code || !name || !billerCode) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const buildingData: CreateBuildingRequest = {
        code,
        name,
        billerCode,
      };

      await buildingService.createBuilding(buildingData);
      Alert.alert(
        "Success",
        isNewUser
          ? "Your first building has been created successfully!"
          : "Building added successfully"
      );
      onBuildingAdded();
      onClose();
      // Reset form
      setCode("");
      setName("");
      setBillerCode("");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to add building"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              {isNewUser && (
                <Feather
                  name="home"
                  size={24}
                  color={theme.colors.primary}
                  style={styles.modalIcon}
                />
              )}
              <Text style={styles.modalTitle}>
                {isNewUser ? "Create Your First Building" : "Add New Building"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          {isNewUser && (
            <View style={styles.newUserBanner}>
              <Text style={styles.newUserBannerText}>
                Welcome! Let's set up your first property
              </Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Building Code</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="Enter building code"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Building Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter building name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Biller Code</Text>
              <TextInput
                style={styles.input}
                value={billerCode}
                onChangeText={setBillerCode}
                placeholder="Enter biller code"
              />
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading
                  ? isNewUser
                    ? "Creating..."
                    : "Adding..."
                  : isNewUser
                  ? "Create Building"
                  : "Add Building"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    width: "90%",
    maxWidth: 500,
    ...theme.shadows.large,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalIcon: {
    marginRight: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  form: {
    padding: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginLeft: theme.spacing.md,
  },
  cancelButton: {
    backgroundColor: theme.colors.card,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
  },
  submitButtonText: {
    color: "white",
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
  },
  newUserBanner: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  newUserBannerText: {
    color: "white",
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
  },
});

export default AddBuildingModal;
