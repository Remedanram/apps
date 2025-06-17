import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Room } from "../types/room";
import { Tenant } from "../types/tenant";

// Screens
import DashboardScreen from "../screens/DashboardScreen";
import MonthlyScreen from "../screens/MonthlyScreen";
import StatusScreen from "../screens/StatusScreen";
import TrendsScreen from "../screens/TrendsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import LoginScreen from "../screens/LoginScreen";
import TenantLedgerScreen from "../screens/TenantLedgerScreen";
import TransactionsListScreen from "../screens/TransactionsListScreen";
import RoomListScreen from "../screens/RoomListScreen";
import TenantListScreen from "../screens/TenantListScreen";
import AddRoomScreen from "../screens/AddRoomScreen";
import AddTenantScreen from "../screens/AddTenantScreen";
import PaidRoomsScreen from "../screens/PaidRoomsScreen";
import PendingRoomsScreen from "../screens/PendingRoomsScreen";
import MonthlyDetailsScreen from "../screens/MonthlyDetailsScreen";
import EditRoomScreen from "../screens/EditRoomScreen";
import EditTenantScreen from "../screens/EditTenantScreen";
import BuildingSelectionScreen from "../screens/BuildingSelectionScreen";

// Types
export type RootStackParamList = {
  Auth: undefined;
  BuildingSelection: undefined;
  Main: undefined;
  TenantLedger: { phoneNumber: string };
  TransactionsList: { status?: string };
  RoomList: undefined;
  TenantList: undefined;
  AddRoom: undefined;
  AddTenant: undefined;
  EditRoom: { room: Room };
  EditTenant: { tenant: Tenant };
  Dashboard: undefined;
  PaidRooms: undefined;
  PendingRooms: undefined;
  MonthlyDetails: { month: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Feather.glyphMap;

          switch (route.name) {
            case "Dashboard":
              iconName = "home";
              break;
            case "Monthly":
              iconName = "calendar";
              break;
            case "Status":
              iconName = "check-circle";
              break;
            case "Trends":
              iconName = "trending-up";
              break;
            case "Settings":
              iconName = "settings";
              break;
            default:
              iconName = "circle";
          }

          return <Feather name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Monthly" component={MonthlyScreen} />
      <Tab.Screen name="Status" component={StatusScreen} />
      <Tab.Screen name="Trends" component={TrendsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={
          {
            // headerShown: false,
          }
        }
      >
        <Stack.Screen
          name="Auth"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BuildingSelection"
          component={BuildingSelectionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="TenantLedger" component={TenantLedgerScreen} />
        <Stack.Screen
          name="TransactionsList"
          component={TransactionsListScreen}
        />
        <Stack.Screen name="RoomList" component={RoomListScreen} />
        <Stack.Screen name="TenantList" component={TenantListScreen} />
        <Stack.Screen name="AddRoom" component={AddRoomScreen} />
        <Stack.Screen name="AddTenant" component={AddTenantScreen} />
        <Stack.Screen name="EditRoom" component={EditRoomScreen} />
        <Stack.Screen name="EditTenant" component={EditTenantScreen} />
        <Stack.Screen name="PaidRooms" component={PaidRoomsScreen} />
        <Stack.Screen name="PendingRooms" component={PendingRoomsScreen} />
        <Stack.Screen name="MonthlyDetails" component={MonthlyDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
