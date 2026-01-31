import { View, Text, Button, ActivityIndicator } from "react-native";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useVehicleDetails } from "./logic";
import { VehiclesStackParamList } from "@/src/navigation/VehiclesNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

type VehicleDetailsNavProp = NativeStackNavigationProp<VehiclesStackParamList, "VehicleDetails">;
type VehicleDetailsRouteProp = RouteProp<VehiclesStackParamList, "VehicleDetails">;

export default function VehicleDetails() {
  const nav = useNavigation<VehicleDetailsNavProp>();
  const { id } = useRoute<VehicleDetailsRouteProp>().params;
  const { vehicle, loadVehicle, loading, error } = useVehicleDetails(id);

  useFocusEffect(
    useCallback(() => {
      loadVehicle();
    }, [id])
  );

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: "center" }} />;
  if (error) return <Text style={{ padding: 16, color: "red" }}>{error}</Text>;
  if (!vehicle) return <Text style={{ padding: 16 }}>Vehicle not found</Text>;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 22 }}>{vehicle.registration_number}</Text>
      <Text>{vehicle.is_active ? "Active" : "Inactive"}</Text>
      <Text>{vehicle.notes || "No notes"}</Text>

      <Button title="Edit" onPress={() => nav.navigate("VehicleEdit", { id })} />
    </View>
  );
}
