import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./styles";

export const VehicleStatus = ({ vehicles }: { vehicles: any[] }) => {
  const navigation = useNavigation<any>();

  return (
    <View style={{ marginVertical: 8 }}>
      <Text style={styles.sectionTitle}>Vehicle Status</Text>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Vehicles', {
              screen: 'VehicleDetails',
              params: { id: item.id},
            })}
          >
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.registration_number}</Text>

              <View style={[
                styles.statusBadge,
                item.is_active ? styles.green : styles.red
              ]}>
                <Text style={styles.statusText}>
                  {item.is_active ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
