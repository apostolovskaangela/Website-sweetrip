import React from "react";
import { ScrollView, View, Text, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { styles } from "./styles";
import { StatCard } from "@/src/components/StatCard";
import { useDashboardLogic } from "./logic";
import { RecentTrips } from "@/src/components/RecentTrips";
import { VehicleStatus } from "@/src/components/RecentVehicles";

export const Dashboard = () => {
  const { stats, recentTrips, vehicles, loading } = useDashboardLogic();

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#001F3F" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
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
        <VehicleStatus vehicles={vehicles} />
      </View>
    </ScrollView>
  );
};
