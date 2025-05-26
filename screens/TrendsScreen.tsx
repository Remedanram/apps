import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Text } from "react-native";
import Card from "../components/Card";
import { mockTrendsData } from "../services/mockData";
import theme from "../constants/theme";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const TrendsScreen = () => {
  const [data, setData] = useState(mockTrendsData);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setData(mockTrendsData);
    setRefreshing(false);
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const occupancyData = {
    labels: data.occupancyTrend.map((item) => item.month),
    datasets: [
      {
        data: data.occupancyTrend.map((item) => item.rate),
        color: (opacity = 1) => theme.colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  const revenueData = {
    labels: data.revenueTrend.map((item) => item.month),
    datasets: [
      {
        data: data.revenueTrend.map((item) => item.amount),
        color: (opacity = 1) => theme.colors.success,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.chartCard}>
        <Text style={styles.cardTitle}>Occupancy Rate Trend</Text>
        <LineChart
          data={occupancyData}
          width={screenWidth - theme.spacing.md * 4}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </Card>

      <Card style={styles.chartCard}>
        <Text style={styles.cardTitle}>Revenue Trend</Text>
        <LineChart
          data={revenueData}
          width={screenWidth - theme.spacing.md * 4}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => theme.colors.success,
          }}
          bezier
          style={styles.chart}
          formatYLabel={(value) => `$${value}`}
        />
      </Card>

      <Card style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Average Occupancy</Text>
            <Text
              style={[styles.summaryValue, { color: theme.colors.primary }]}
            >
              {(
                data.occupancyTrend.reduce((acc, curr) => acc + curr.rate, 0) /
                data.occupancyTrend.length
              ).toFixed(1)}
              %
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Average Revenue</Text>
            <Text
              style={[styles.summaryValue, { color: theme.colors.success }]}
            >
              $
              {(
                data.revenueTrend.reduce((acc, curr) => acc + curr.amount, 0) /
                data.revenueTrend.length
              ).toFixed(0)}
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  chartCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  chart: {
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  summaryCard: {
    padding: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
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
});

export default TrendsScreen;
