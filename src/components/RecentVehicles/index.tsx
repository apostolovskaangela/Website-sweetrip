import { listVirtualizationConfig } from "@/src/lib/listConfig";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import type { Vehicle } from "../types";
import { getVehicleStatusBadge } from "./logic";
import { styles } from "./styles";

interface VehicleStatusProps {
  vehicles: Vehicle[];
}

export const VehicleStatus: React.FC<VehicleStatusProps> = ({ vehicles = [] }) => {
  const navigation = useNavigation<any>();

  const keyExtractor = useCallback((item: Vehicle) => item.id.toString(), []);
  const renderItem = useCallback(
    ({ item }: { item: Vehicle }) => (
      <RecentVehicleCard
        item={item}
        onPress={() =>
          navigation.navigate("Vehicles", {
            screen: "VehicleDetails",
            params: { id: item.id },
          })
        }
      />
    ),
    [navigation]
  );

  if (!vehicles.length) {
    return <Text style={{ margin: 8 }}>No vehicles available</Text>;
  }

  return (
    <View style={{ marginVertical: 8 }}>
      <Text style={styles.sectionTitle}>Vehicle Status</Text>
      <FlatList
        data={vehicles}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        {...listVirtualizationConfig}
      />
    </View>
  );
};

interface RecentVehicleCardProps {
  item: Vehicle;
  onPress: () => void;
}

const RecentVehicleCard = React.memo<RecentVehicleCardProps>(function RecentVehicleCard({
  item,
  onPress,
}) {
  const badge = getVehicleStatusBadge(item);
  return (
    <TouchableOpacity onPress={onPress}>
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
});
