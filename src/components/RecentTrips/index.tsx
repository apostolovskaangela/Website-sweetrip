import { listVirtualizationConfig } from "@/src/lib/listConfig";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import type { Trip } from "../types";
import { getStatusBadgeStyle, getStatusLabel } from "./logic";
import { styles } from "./styles";

interface RecentTripsProps {
  trips: Trip[];
}

export const RecentTrips: React.FC<RecentTripsProps> = ({ trips = [] }) => {
  const navigation = useNavigation<any>();

  const keyExtractor = useCallback((item: Trip) => item.id.toString(), []);
  const renderItem = useCallback(
    ({ item }: { item: Trip }) => (
      <RecentTripCard
        item={item}
        onPress={() =>
          navigation.navigate("Trips", {
            screen: "TripDetails",
            params: { id: item.id },
          })
        }
      />
    ),
    [navigation]
  );

  return (
    <View style={{ marginVertical: 8 }}>
      <Text style={styles.sectionTitle}>Recent Trips</Text>
      <FlatList
        data={trips}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        {...listVirtualizationConfig}
      />
    </View>
  );
};

interface RecentTripCardProps {
  item: Trip;
  onPress: () => void;
}

const RecentTripCard = React.memo<RecentTripCardProps>(function RecentTripCard({
  item,
  onPress,
}) {
  const badgeStyle = getStatusBadgeStyle(item.status);
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.card}>
        <View>
          <Text style={styles.cardTitle}>
            {item.destination_from} → {item.destination_to}
          </Text>
          <Text style={styles.cardSubtitle}>
            {item.driver?.name ?? "No driver assigned"}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: badgeStyle.backgroundColor },
          ]}
        >
          <Text style={[styles.statusText, { color: badgeStyle.textColor }]}>
            {getStatusLabel(item.status, item.status_label)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});
