import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Building } from "../services/buildingService";

export const useSelectedBuilding = () => {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSelectedBuilding();
  }, []);

  const loadSelectedBuilding = async () => {
    try {
      const buildingData = await AsyncStorage.getItem("selectedBuilding");
      if (buildingData) {
        setSelectedBuilding(JSON.parse(buildingData));
      }
    } catch (error) {
      console.error("Error loading selected building:", error);
    } finally {
      setLoading(false);
    }
  };

  return { selectedBuilding, loading };
};
