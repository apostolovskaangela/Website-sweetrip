import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getVehicleStatusBadge } from "./logic";
import { styles } from "./styles";
import { Vehicle } from "../types";

interface VehicleStatusProps {
  vehicles: Vehicle[];
}

export const VehicleStatus: React.FC<VehicleStatusProps> = ({ vehicles = [] }) => {
  const navigation = useNavigation<any>();

  if (!vehicles.length) {
    return <Text style={{ margin: 8 }}>No vehicles available</Text>;
  }

  return (
    <View style={{ marginVertical: 8 }}>
      <Text style={styles.sectionTitle}>Vehicle Status</Text>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const badge = getVehicleStatusBadge(item);

          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Vehicles", {
                  screen: "VehicleDetails",
                  params: { id: item.id },
                })
              }
            >
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {item.registration_number ?? "No registration"}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: badge.backgroundColor },
                  ]}
                >
                  <Text style={[styles.statusText, { color: badge.textColor }]}>
                    {badge.label}
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
