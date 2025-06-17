import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./navigation/AppNavigator";
import { BuildingProvider } from "./contexts/BuildingContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <BuildingProvider>
        <AppNavigator />
      </BuildingProvider>
    </SafeAreaProvider>
  );
}
