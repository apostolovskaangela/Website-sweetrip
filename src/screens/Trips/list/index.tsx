import { listVirtualizationConfig } from "@/src/lib/listConfig";
import { DashboardTrip, TripsStackParamList } from "@/src/navigation/types";
import { useRenderCount } from "@/src/utils/performance";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";

import { useTripsListLogic } from "./logic";
import { Screen } from "@/src/components/ui/Screen";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { Text, useTheme } from "react-native-paper";
import { FadeIn } from "@/src/components/ui/FadeIn";
import { makeStyles } from "./styles";

export default function TripsListScreen() {
  useRenderCount("TripsListScreen");
  const { trips, canCreate, loading, error } = useTripsListLogic();
  const navigation =
    useNavigation<NativeStackNavigationProp<TripsStackParamList>>();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const keyExtractor = useCallback((item: DashboardTrip) => item.id.toString(), []);
  const renderItem = useCallback(
    ({ item, index }: { item: DashboardTrip; index: number }) => (
      <FadeIn fromY={10} durationMs={220 + Math.min(index, 6) * 30}>
        <TripCard trip={item} />
      </FadeIn>
    ),
    []
  );
  const onPressCreate = useCallback(
    () => navigation.navigate("TripCreate"),
    [navigation]
  );

  if (loading) return <ActivityIndicator style={styles.loading} size="large" color={theme.colors.primary} />;

  return (
    <Screen accessibilityLabel="Trips list">
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Trips</Text>
          <Text style={styles.subtitle}>Manage and track all your trips</Text>
        </View>

        {canCreate && (
          <PrimaryButton
            icon="plus"
            onPress={onPressCreate}
            accessibilityLabel="Create new trip"
            contentStyle={styles.newButtonContent}
          >
            New
          </PrimaryButton>
        )}
      </View>

      {!!error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={trips}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        {...listVirtualizationConfig}
      />
    </Screen>
  );
}

interface TripCardProps {
  trip: DashboardTrip;
}

const TripCard = React.memo<TripCardProps>(function TripCard({ trip }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<TripsStackParamList>>();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const onPress = useCallback(
    () => navigation.navigate("TripDetails", { id: trip.id }),
    [navigation, trip.id]
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Trip ${trip.trip_number}. ${trip.destination_from} to ${trip.destination_to}`}
      accessibilityHint="Opens trip details"
    >
      <View style={styles.tripCard}>
        <Text style={styles.tripRoute}>
          {trip.destination_from} → {trip.destination_to}
        </Text>

        <Text style={styles.tripStatus}>
          {trip.status_label}
        </Text>

        <View style={styles.tripMeta}>
          <Text style={styles.tripMetaText}>
            Vehicle: {trip.vehicle?.registration_number ?? "N/A"}
          </Text>
          <Text style={styles.tripMetaText}>
            Trip #: {trip.trip_number}
          </Text>
          <Text style={styles.tripMetaText}>
            Date: {trip.trip_date}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});
