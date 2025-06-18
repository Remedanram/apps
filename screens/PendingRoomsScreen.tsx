import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Card from "../components/Card";
import theme from "../constants/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import matchService, { MatchRoom } from "../services/matchService";
import api from "../services/api";
import { useBuilding } from "../contexts/BuildingContext";

type Props = NativeStackScreenProps<RootStackParamList, "PendingRooms">;

interface PaymentModalData {
  room: MatchRoom;
  amount: string;
  description: string;
}

const PendingRoomsScreen: React.FC<Props> = ({ route }) => {
  const { period } = route.params;
  const { selectedBuilding } = useBuilding();
  const [loading, setLoading] = useState(true);
  const [unpaidRooms, setUnpaidRooms] = useState<MatchRoom[]>([]);
  const [processingPayment, setProcessingPayment] = useState<string | null>(
    null
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentModalData | null>(null);

  useEffect(() => {
    if (selectedBuilding?.id) {
      loadData();
    }
  }, [period, selectedBuilding]);

  const loadData = async () => {
    if (!selectedBuilding?.id) return;
    try {
      console.log("Loading data for period:", period);
      console.log("Building ID:", selectedBuilding.id);
      setLoading(true);
      const rooms = await matchService.getUnpaidRooms(
        selectedBuilding.id,
        period
      );
      console.log("Raw API response:", rooms);
      console.log("Is array?", Array.isArray(rooms));
      console.log("Array length:", Array.isArray(rooms) ? rooms.length : 0);
      setUnpaidRooms(Array.isArray(rooms) ? rooms : []);
    } catch (error) {
      console.error("Error loading pending rooms:", error);
      setUnpaidRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentPress = (room: MatchRoom) => {
    console.log(
      "Payment button pressed for room:",
      JSON.stringify(room, null, 2)
    );
    if (!room.phone) {
      console.error("Phone number is missing from room data:", room);
      Alert.alert("Error", "Tenant phone number is missing");
      return;
    }
    setPaymentData({
      room,
      amount: Math.abs(room.amount).toString(),
      description: `Cash collected on ${
        new Date().toISOString().split("T")[0]
      }`,
    });
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!paymentData) {
      console.log("No payment data available");
      return;
    }

    try {
      console.log(
        "Processing payment for:",
        JSON.stringify(paymentData, null, 2)
      );
      setProcessingPayment(paymentData.room.roomName);
      setShowPaymentModal(false);

      if (!paymentData.room.phone) {
        console.error(
          "Phone number is missing from payment data:",
          paymentData
        );
        Alert.alert("Error", "Tenant phone number is missing");
        return;
      }

      const amount = parseFloat(paymentData.amount);
      if (isNaN(amount) || amount <= 0) {
        console.error("Invalid amount:", paymentData.amount);
        Alert.alert("Error", "Please enter a valid amount");
        return;
      }

      if (!selectedBuilding?.id) {
        console.error("No building selected");
        Alert.alert(
          "Error",
          "No building selected. Please select a building first."
        );
        return;
      }

      const requestData = {
        roomName: paymentData.room.roomName,
        phone: paymentData.room.phone,
        period,
        amount,
        description: paymentData.description,
      };
      console.log(
        "Sending payment request with data:",
        JSON.stringify(requestData, null, 2)
      );

      const response = await api.post(
        `/buildings/${selectedBuilding.id}/matches/manual-pay?roomName=${paymentData.room.roomName}&phone=${paymentData.room.phone}&period=${period}`,
        {
          amount: amount,
          description: paymentData.description,
        }
      );

      console.log("Payment response:", JSON.stringify(response, null, 2));

      if (response.data) {
        Alert.alert("Success", "Payment processed successfully", [
          {
            text: "OK",
            onPress: loadData,
          },
        ]);
      }
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Error", "Failed to process payment. Please try again.");
    } finally {
      setProcessingPayment(null);
      setPaymentData(null);
    }
  };

  const renderPaymentModal = () => {
    if (!paymentData) {
      console.log("No payment data for modal");
      return null;
    }

    console.log("Rendering payment modal with data:", paymentData);

    return (
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          console.log("Modal close requested");
          setShowPaymentModal(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Process Payment</Text>
              <TouchableOpacity
                onPress={() => {
                  console.log("Close button pressed");
                  setShowPaymentModal(false);
                }}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.roomInfo}>
                Room: {paymentData.room.roomName}
              </Text>
              <Text style={styles.tenantInfo}>
                Tenant: {paymentData.room.tenantName}
              </Text>
              <Text style={styles.tenantInfo}>
                Phone: {paymentData.room.phone}
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Amount</Text>
                <TextInput
                  style={styles.input}
                  value={paymentData.amount}
                  onChangeText={(text) => {
                    console.log("Amount changed:", text);
                    setPaymentData({ ...paymentData, amount: text });
                  }}
                  keyboardType="decimal-pad"
                  placeholder="Enter amount"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.descriptionInput]}
                  value={paymentData.description}
                  onChangeText={(text) => {
                    console.log("Description changed:", text);
                    setPaymentData({ ...paymentData, description: text });
                  }}
                  placeholder="Enter description"
                  multiline
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  console.log("Cancel button pressed");
                  setShowPaymentModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  console.log("Confirm button pressed");
                  handlePayment();
                }}
              >
                <Text style={styles.confirmButtonText}>Confirm Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  const renderRoomItem = ({ item }: { item: MatchRoom }) => (
    <Card style={styles.roomCard}>
      <View style={styles.roomHeader}>
        <View>
          <Text style={styles.roomNumber}>{item.roomName}</Text>
          <Text style={styles.tenantName}>{item.tenantName}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>${Math.abs(item.amount)}</Text>
          <Text style={styles.dueDate}>
            Due:{" "}
            {item.day ? new Date(item.day).toLocaleDateString() : "Not set"}
          </Text>
        </View>
      </View>
      <View style={styles.statusAndButtonContainer}>
        <View style={styles.statusBadge}>
          <Feather name="clock" size={16} color={theme.colors.warning} />
          <Text style={styles.statusText}>Pending</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.payButton,
            processingPayment === item.roomName && styles.payButtonDisabled,
          ]}
          onPress={() => handlePaymentPress(item)}
          disabled={processingPayment === item.roomName}
        >
          {processingPayment === item.roomName ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.payButtonText}>Pay</Text>
          )}
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading pending rooms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={unpaidRooms}
        renderItem={renderRoomItem}
        keyExtractor={(item) => item.roomName}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.noDataText}>No pending rooms for {period}</Text>
        }
      />
      {renderPaymentModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  listContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  roomCard: {
    padding: theme.spacing.md,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  roomNumber: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    color: theme.colors.text.primary,
  },
  tenantName: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "700",
    color: theme.colors.warning,
  },
  dueDate: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  statusAndButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.warning + "20",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    marginLeft: theme.spacing.xs,
    color: theme.colors.warning,
    fontSize: theme.typography.sizes.sm,
    fontWeight: "600",
  },
  noDataText: {
    textAlign: "center",
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.md,
    padding: theme.spacing.md,
    fontStyle: "italic",
  },
  payButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.sm + 4,
    borderRadius: theme.borderRadius.sm,
    minWidth: 80,
    alignItems: "center",
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: "white",
    fontSize: theme.typography.sizes.sm,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    width: "90%",
    maxWidth: 400,
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "600",
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  modalBody: {
    marginBottom: theme.spacing.lg,
  },
  roomInfo: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  tenantInfo: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: "top",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.md,
  },
  modalButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "white",
    fontSize: theme.typography.sizes.sm,
    fontWeight: "600",
  },
});

export default PendingRoomsScreen;
