import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TripsStackParamList, DashboardTrip } from "@/src/navigation/types";

import { useTripsListLogic } from "./logic";
import { styles } from "./styles";

export default function TripsListScreen() {
  const { trips, canCreate, loading, error } = useTripsListLogic();
  const navigation =
    useNavigation<NativeStackNavigationProp<TripsStackParamList>>();

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
            onPress={() => navigation.navigate("TripCreate")}
          >
            <Text style={styles.createText}>＋ New Trip</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={trips}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TripCard trip={item} />}
      />
    </View>
  );
}

interface TripCardProps {
  trip: DashboardTrip;
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<TripsStackParamList>>();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("TripDetails", { id: trip.id })}
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
};
