import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./styles";

export const RecentTrips = ({ trips }: { trips: any[] }) => {
  const navigation = useNavigation<any>();

  return (
    <View style={{ marginVertical: 8 }}>
      <Text style={styles.sectionTitle}>Recent Trips</Text>

      <FlatList
        data={trips}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Trips', {
                screen: 'TripDetails',
                params: { id: item.id},
              })}
          >
            <View style={styles.card}>
              <View>
                <Text style={styles.cardTitle}>
                  {item.destination_from} → {item.destination_to}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {item.driver?.name || "No driver assigned"}
                </Text>
              </View>

              <View style={[
                styles.statusBadge,
                item.status === "completed"
                  ? styles.green
                  : item.status === "not_started"
                  ? styles.blue
                  : styles.orange
              ]}>
                <Text style={styles.statusText}>{item.status_label}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
