import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Building {
  id: string;
  name: string;
}

interface BuildingContextType {
  selectedBuilding: Building | null;
  setSelectedBuilding: (building: Building | null) => Promise<void>;
}

const BuildingContext = createContext<BuildingContextType | undefined>(
  undefined
);

const STORAGE_KEY = "@selected_building";

export const BuildingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedBuilding, setSelectedBuildingState] =
    useState<Building | null>(null);

  // Load saved building on mount
  useEffect(() => {
    loadSavedBuilding();
  }, []);

  const loadSavedBuilding = async () => {
    try {
      const savedBuilding = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedBuilding) {
        setSelectedBuildingState(JSON.parse(savedBuilding));
      }
    } catch (error) {
      console.error("Error loading saved building:", error);
    }
  };

  const setSelectedBuilding = async (building: Building | null) => {
    try {
      if (building) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(building));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
      setSelectedBuildingState(building);
    } catch (error) {
      console.error("Error saving building:", error);
    }
  };

  return (
    <BuildingContext.Provider value={{ selectedBuilding, setSelectedBuilding }}>
      {children}
    </BuildingContext.Provider>
  );
};

export const useBuilding = () => {
  const context = useContext(BuildingContext);
  if (context === undefined) {
    throw new Error("useBuilding must be used within a BuildingProvider");
  }
  return context;
};
