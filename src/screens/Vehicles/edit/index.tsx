import { View, Text, TextInput, Button, Switch, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useEditVehicle } from "./logic";
import { VehiclesStackParamList } from "@/src/navigation/VehiclesNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function EditVehicle() {
  const { id } = useRoute<any>().params;
  const navigation = useNavigation<NativeStackNavigationProp<VehiclesStackParamList, "VehicleEdit">>();

  const { form, setField, update, loading, error } = useEditVehicle({ id, navigation });

  if (loading || !form) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={{ padding: 16 }}>
      {error && <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>}

      <Text>Registration Number</Text>
      <TextInput
        value={form.registration_number}
        onChangeText={v => setField("registration_number", v)}
        style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
      />

      <Text>Notes</Text>
      <TextInput
        value={form.notes}
        onChangeText={v => setField("notes", v)}
        style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
      />

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Text>Active: </Text>
        <Switch
          value={form.is_active}
          onValueChange={v => setField("is_active", v)}
        />
      </View>

      <Button title="Update" onPress={update} />
    </View>
  );
}
