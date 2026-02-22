import React, { useMemo } from "react";
import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatCard } from "@/src/components/StatCard";
import { useDashboardLogic } from "./logic";
import { RecentTrips } from "@/src/components/RecentTrips";
import { VehicleStatus } from "@/src/components/RecentVehicles";
import { Screen } from "@/src/components/ui/Screen";
import { Text, ActivityIndicator, useTheme } from "react-native-paper";
import { makeStyles } from "./styles";
import { useAuth } from "@/src/hooks/useAuth";

export const Dashboard = () => {
  const { stats, recentTrips, vehicles, loading } = useDashboardLogic();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { user } = useAuth();
  const isDriver = user?.roles?.includes("driver") ?? false;

  if (loading) {
    return (
      <Screen accessibilityLabel="Dashboard loading">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll accessibilityLabel="Dashboard">
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Dashboard
        </Text>
        <Text style={styles.subtitle}>
          Monitor your fleet operations in real-time
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title="Active Trips"
          value={stats.active_trips.toString()}
          icon={
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={28}
            />
          }
        />

        <StatCard
          title="Total Vehicles"
          value={stats.total_vehicles.toString()}
          icon={<MaterialCommunityIcons name="truck" size={24} />}
        />

        <StatCard
          title="Distance Today"
          value={`${stats.distance_today} km`}
          icon={
            <MaterialCommunityIcons
              name="map-marker-distance"
              size={24}
            />
          }
        />

        <StatCard
          title="Efficiency"
          value={`${stats.efficiency}%`}
          icon={<MaterialCommunityIcons name="trending-up" size={24} />}
        />
      </View>

      <View>
        <RecentTrips trips={recentTrips} />
        {!isDriver && <VehicleStatus vehicles={vehicles} />}
      </View>
    </Screen>
  );
};
