import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Card from "../components/Card";
import { Feather } from "@expo/vector-icons";
import theme from "../constants/theme";
import { format, parse } from "date-fns";
import matchService, { MatchRoom } from "../services/matchService";
import api from "../services/api";
import { useBuilding } from "../contexts/BuildingContext";

type Props = NativeStackScreenProps<RootStackParamList, "MonthlyDetails">;

interface PaymentModalData {
  room: MatchRoom;
  amount: string;
  description: string;
}

const MonthlyDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { period } = route.params;
  const { selectedBuilding } = useBuilding();
  const [paidRooms, setPaidRooms] = useState<MatchRoom[]>([]);
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
      const [paid, unpaid] = await Promise.all([
        matchService.getPaidRooms(selectedBuilding.id, period),
        matchService.getUnpaidRooms(selectedBuilding.id, period),
      ]);
      setPaidRooms(Array.isArray(paid) ? paid : []);
      setUnpaidRooms(Array.isArray(unpaid) ? unpaid : []);
    } catch (error) {
      console.error("Error loading monthly details:", error);
      setPaidRooms([]);
      setUnpaidRooms([]);
    }
  };

  const handlePaymentPress = (room: MatchRoom) => {
    console.log("Payment button pressed for room:", room);
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
      console.log("Processing payment for:", paymentData);
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

      if (!selectedBuilding?.id) {
        console.error("No building selected");
        Alert.alert(
          "Error",
          "No building selected. Please select a building first."
        );
        return;
      }

      const amount = parseFloat(paymentData.amount);
      if (isNaN(amount) || amount <= 0) {
        console.error("Invalid amount:", paymentData.amount);
        Alert.alert("Error", "Please enter a valid amount");
        return;
      }

      const requestData = {
        roomName: paymentData.room.roomName,
        phone: paymentData.room.phone,
        period,
        amount,
        description: paymentData.description,
      };
      console.log("Sending payment request with data:", requestData);

      const response = await api.post(
        `/buildings/${selectedBuilding.id}/matches/manual-pay?roomName=${paymentData.room.roomName}&phone=${paymentData.room.phone}&period=${period}`,
        {
          amount: amount,
          description: paymentData.description,
        }
      );

      console.log("Payment response:", response);

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
              <Text style={styles.modalRoomInfo}>
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  const parsedDate = parse(period, "yyyy-MM", new Date());
  const monthName = format(parsedDate, "MMMM");
  const year = format(parsedDate, "yyyy");

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthTitle}>
          {monthName} {year}
        </Text>
      </View>

      {/* Paid Rooms Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="check-circle" size={20} color={theme.colors.success} />
          <Text style={[styles.sectionTitle, { color: theme.colors.success }]}>
            Paid Rooms
          </Text>
        </View>
        {paidRooms.length > 0 ? (
          paidRooms.map((room) => (
            <Card key={room.roomName} style={styles.roomCard}>
              <View style={styles.roomInfo}>
                <View>
                  <Text style={styles.roomNumber}>{room.roomName}</Text>
                  <Text style={styles.tenantName}>{room.tenantName}</Text>
                  <Text style={styles.statusText}>
                    Status: {room.status.replace(/_/g, " ")}
                  </Text>
                </View>
                <View style={styles.amountContainer}>
                  <Text
                    style={[styles.amount, { color: theme.colors.success }]}
                  >
                    ${Math.abs(room.amount)}
                  </Text>
                  <Text style={styles.date}>Paid: {formatDate(room.day)}</Text>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <Text style={styles.noDataText}>No paid rooms for this month</Text>
        )}
      </View>

      {/* Pending Rooms Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="clock" size={20} color={theme.colors.warning} />
          <Text style={[styles.sectionTitle, { color: theme.colors.warning }]}>
            Pending Rooms
          </Text>
        </View>
        {unpaidRooms.length > 0 ? (
          unpaidRooms.map((room) => (
            <Card key={room.roomName} style={styles.roomCard}>
              <View style={styles.roomInfo}>
                <View>
                  <Text style={styles.roomNumber}>{room.roomName}</Text>
                  <Text style={styles.tenantName}>{room.tenantName}</Text>
                  <Text style={styles.statusText}>
                    Status: {room.status.replace(/_/g, " ")}
                  </Text>
                </View>
                <View style={styles.amountAndButtonContainer}>
                  <View style={styles.amountAndDate}>
                    <Text
                      style={[styles.amount, { color: theme.colors.warning }]}
                    >
                      ${Math.abs(room.amount)}
                    </Text>
                    <Text style={styles.date}>Due: {formatDate(room.day)}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.payButton,
                      processingPayment === room.roomName &&
                        styles.payButtonDisabled,
                    ]}
                    onPress={() => handlePaymentPress(room)}
                    disabled={processingPayment === room.roomName}
                  >
                    {processingPayment === room.roomName ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.payButtonText}>Pay</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <Text style={styles.noDataText}>No pending rooms for this month</Text>
        )}
      </View>

      {/* Summary Section */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Monthly Summary</Text>
        <View style={styles.summaryContent}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Paid</Text>
            <Text
              style={[styles.summaryValue, { color: theme.colors.success }]}
            >
              ${paidRooms.reduce((sum, room) => sum + Math.abs(room.amount), 0)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Pending</Text>
            <Text
              style={[styles.summaryValue, { color: theme.colors.warning }]}
            >
              $
              {unpaidRooms.reduce(
                (sum, room) => sum + Math.abs(room.amount),
                0
              )}
            </Text>
          </View>
        </View>
      </Card>
      {renderPaymentModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    marginBottom: theme.spacing.md,
  },
  monthTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "600",
    color: theme.colors.text.primary,
    textAlign: "center",
  },
  section: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  roomCard: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  roomInfo: {
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
  statusText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amountAndButtonContainer: {
    alignItems: "flex-end",
  },
  amountAndDate: {
    alignItems: "flex-end",
    marginBottom: theme.spacing.sm,
  },
  amount: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "700",
  },
  date: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
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
  noDataText: {
    textAlign: "center",
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.md,
    padding: theme.spacing.md,
    fontStyle: "italic",
  },
  summaryCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
  },
  summaryTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  summaryContent: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "700",
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
  modalRoomInfo: {
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

export default MonthlyDetailsScreen;
