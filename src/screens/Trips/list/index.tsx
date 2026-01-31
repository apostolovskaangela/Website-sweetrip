import { listVirtualizationConfig } from "@/src/lib/listConfig";
import { DashboardTrip, TripsStackParamList } from "@/src/navigation/types";
import { useRenderCount } from "@/src/utils/performance";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTripsListLogic } from "./logic";
import { styles } from "./styles";

export default function TripsListScreen() {
  useRenderCount("TripsListScreen");
  const { trips, canCreate, loading, error } = useTripsListLogic();
  const navigation =
    useNavigation<NativeStackNavigationProp<TripsStackParamList>>();

  const keyExtractor = useCallback((item: DashboardTrip) => item.id.toString(), []);
  const renderItem = useCallback(
    ({ item }: { item: DashboardTrip }) => <TripCard trip={item} />,
    []
  );
  const onPressCreate = useCallback(
    () => navigation.navigate("TripCreate"),
    [navigation]
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Trips</Text>
          <Text style={styles.subtitle}>Manage and track all your trips</Text>
        </View>

        {canCreate && (
          <TouchableOpacity
            style={styles.createBtn}
            onPress={onPressCreate}
          >
            <Text style={styles.createText}>＋ New Trip</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={trips}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        {...listVirtualizationConfig}
      />
    </View>
  );
}

interface TripCardProps {
  trip: DashboardTrip;
}

const TripCard = React.memo<TripCardProps>(function TripCard({ trip }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<TripsStackParamList>>();
  const onPress = useCallback(
    () => navigation.navigate("TripDetails", { id: trip.id }),
    [navigation, trip.id]
  );

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
    >
      <Text style={styles.route}>
        {trip.destination_from} → {trip.destination_to}
      </Text>

      <Text style={styles.status}>{trip.status_label}</Text>

      <Text>Vehicle: {trip.vehicle?.registration_number ?? "N/A"}</Text>
      <Text>Trip #: {trip.trip_number}</Text>
      <Text>Date: {trip.trip_date}</Text>
    </TouchableOpacity>
  );
});
