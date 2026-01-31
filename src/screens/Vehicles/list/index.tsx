// src/screens/Vehicles/list/index.tsx
import { listVirtualizationConfig } from "@/src/lib/listConfig";
import { VehiclesStackParamList } from "@/src/navigation/VehiclesNavigator";
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
import type { Vehicle } from "../types";
import { useVehicles } from "./logic";
import { styles } from "./styles";

export default function VehicleList() {
  const nav = useNavigation<
    NativeStackNavigationProp<VehiclesStackParamList, "VehiclesList">
  >();
  const { vehicles, loading, error, reload } = useVehicles();

  const keyExtractor = useCallback((v: Vehicle) => v.id.toString(), []);
  const onPressVehicle = useCallback(
    (id: number) => nav.navigate("VehicleDetails", { id }),
    [nav]
  );
  const renderItem = useCallback(
    ({ item }: { item: Vehicle }) => (
      <VehicleCard item={item} onPressVehicle={onPressVehicle} />
    ),
    [onPressVehicle]
  );
  const onPressCreate = useCallback(
    () => nav.navigate("VehicleCreate"),
    [nav]
  );

  const canCreate = true; // TODO: use RoleFactory

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  if (error)
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>
        <TouchableOpacity onPress={reload}>
          <Text style={{ color: "blue" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Vehicles</Text>
          <Text style={styles.subtitle}>See all your vehicles</Text>
        </View>

        {canCreate && (
          <TouchableOpacity
            style={styles.createBtn}
            onPress={onPressCreate}
          >
            <Text style={styles.createText}>＋ New Vehicle</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        {...listVirtualizationConfig}
      />
    </View>
  );
}

interface VehicleCardProps {
  item: Vehicle;
  onPressVehicle: (id: number) => void;
}

const VehicleCard = React.memo<VehicleCardProps>(function VehicleCard({
  item,
  onPressVehicle,
}) {
  const onPress = useCallback(
    () => onPressVehicle(item.id),
    [onPressVehicle, item.id]
  );
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{item.registration_number}</Text>
      <Text style={item.is_active ? styles.active : styles.inactive}>
        {item.is_active ? "Active" : "Inactive"}
      </Text>
      {!!item.notes && <Text>{item.notes}</Text>}
    </TouchableOpacity>
  );
});
