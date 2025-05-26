import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Card from "./Card";
import theme from "../constants/theme";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Feather.glyphMap;
  trend?: number;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = theme.colors.primary,
}) => {
  const trendColor =
    trend && trend > 0 ? theme.colors.success : theme.colors.danger;

  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
          <Feather name={icon} size={20} color={color} />
        </View>
        {trend !== undefined && (
          <View
            style={[
              styles.trendContainer,
              { backgroundColor: trendColor + "20" },
            ]}
          >
            <Feather
              name={trend > 0 ? "trending-up" : "trending-down"}
              size={14}
              color={trendColor}
            />
            <Text style={[styles.trendText, { color: trendColor }]}>
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: theme.spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  trendText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: "500",
    marginLeft: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "700",
    color: theme.colors.text.primary,
  },
});

export default StatsCard;
