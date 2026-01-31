// src/screens/Vehicles/list/index.tsx
import React from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useVehicles } from "./logic";
import { styles } from "./styles";
import { VehiclesStackParamList } from "@/src/navigation/VehiclesNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function VehicleList() {
  const nav = useNavigation<NativeStackNavigationProp<VehiclesStackParamList, "VehiclesList">>();
  const { vehicles, loading, error, reload } = useVehicles();

  // Example: fetch permission dynamically
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Vehicles</Text>
          <Text style={styles.subtitle}>See all your vehicles</Text>
        </View>

        {canCreate && (
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => nav.navigate("VehicleCreate")}
          >
            <Text style={styles.createText}>＋ New Vehicle</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={vehicles}
        keyExtractor={(v) => v.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => nav.navigate("VehicleDetails", { id: item.id })}
          >
            <Text style={styles.title}>{item.registration_number}</Text>
            <Text style={item.is_active ? styles.active : styles.inactive}>
              {item.is_active ? "Active" : "Inactive"}
            </Text>
            {!!item.notes && <Text>{item.notes}</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
