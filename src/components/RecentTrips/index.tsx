import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { getStatusBadgeStyle, getStatusLabel } from "./logic";
import { makeStyles, statusBadgeBg, statusTextColor } from "./styles";
import { Text, useTheme } from "react-native-paper";

type TripLike = {
  id: number;
  destination_from: string;
  destination_to: string;
  status: string;
  status_label?: string;
  driver?: { name?: string } | null;
};

interface RecentTripsProps {
  trips: TripLike[];
}

export const RecentTrips: React.FC<RecentTripsProps> = ({ trips = [] }) => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const onPressTrip = useCallback(
    (id: number) =>
      navigation.navigate("Trips", {
        screen: "TripDetails",
        params: { id },
      }),
    [navigation]
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Trips</Text>
      {trips.map((t) => (
        <RecentTripCard key={t.id} item={t} onPress={() => onPressTrip(t.id)} />
      ))}
    </View>
  );
};

interface RecentTripCardProps {
  item: TripLike;
  onPress: () => void;
}

const RecentTripCard = React.memo<RecentTripCardProps>(function RecentTripCard({
  item,
  onPress,
}) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
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
            statusBadgeBg(badgeStyle.backgroundColor),
          ]}
        >
          <Text style={[styles.statusText, statusTextColor(badgeStyle.textColor)]}>
            {getStatusLabel(item.status, item.status_label)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});
