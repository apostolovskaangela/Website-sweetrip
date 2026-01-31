import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./styles";
import { getStatusBadgeStyle, getStatusLabel } from "./logic";
import { Trip } from "../types";

interface RecentTripsProps {
  trips: Trip[];
}

export const RecentTrips: React.FC<RecentTripsProps> = ({ trips = [] }) => {
  const navigation = useNavigation<any>();

  return (
    <View style={{ marginVertical: 8 }}>
      <Text style={styles.sectionTitle}>Recent Trips</Text>

      <FlatList
        data={trips}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const badgeStyle = getStatusBadgeStyle(item.status);

          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Trips", {
                  screen: "TripDetails",
                  params: { id: item.id },
                })
              }
            >
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
        }}
      />
    </View>
  );
};
