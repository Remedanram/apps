import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Room } from "../types/room";

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

// Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  TenantLedger: { phoneNumber: string };
  TransactionsList: { status?: string };
  RoomList: undefined;
  TenantList: undefined;
  AddRoom: undefined;
  AddTenant: undefined;
  EditRoom: { room: Room };
};

export type MonthlyStackParamList = {
  MonthlyHome: undefined;
  PaidRooms: { period: string };
  PendingRooms: { period: string };
  MonthlyDetails: { period: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const MonthlyStack = createNativeStackNavigator<MonthlyStackParamList>();
const Tab = createBottomTabNavigator();

const MonthlyNavigator = () => {
  return (
    <MonthlyStack.Navigator>
      <MonthlyStack.Screen
        name="MonthlyHome"
        component={MonthlyScreen}
        options={{ headerShown: false }}
      />
      <MonthlyStack.Screen
        name="PaidRooms"
        component={PaidRoomsScreen}
        options={{ title: "Paid Rooms" }}
      />
      <MonthlyStack.Screen
        name="PendingRooms"
        component={PendingRoomsScreen}
        options={{ title: "Pending Rooms" }}
      />
      <MonthlyStack.Screen
        name="MonthlyDetails"
        component={MonthlyDetailsScreen}
        options={{ title: "Monthly Details" }}
      />
    </MonthlyStack.Navigator>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Feather.glyphMap;

          switch (route.name) {
            case "Dashboard":
              iconName = "home";
              break;
            case "Monthly":
              iconName = "calendar";
              break;
            case "Status":
              iconName = "pie-chart";
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
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Monthly" component={MonthlyNavigator} />
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
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Auth" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="TenantLedger"
          component={TenantLedgerScreen}
          options={{ headerShown: true, title: "Tenant Ledger" }}
        />
        <Stack.Screen
          name="TransactionsList"
          component={TransactionsListScreen}
          options={{ headerShown: true, title: "Transactions" }}
        />
        <Stack.Screen
          name="RoomList"
          component={RoomListScreen}
          options={{ headerShown: true, title: "Rooms" }}
        />
        <Stack.Screen
          name="TenantList"
          component={TenantListScreen}
          options={{ headerShown: true, title: "Tenants" }}
        />
        <Stack.Screen
          name="AddRoom"
          component={AddRoomScreen}
          options={{ headerShown: true, title: "Add Room" }}
        />
        <Stack.Screen
          name="AddTenant"
          component={AddTenantScreen}
          options={{ headerShown: true, title: "Add Tenant" }}
        />
        <Stack.Screen
          name="EditRoom"
          component={EditRoomScreen}
          options={{ headerShown: true, title: "Edit Room" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
