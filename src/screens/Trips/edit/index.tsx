import React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useTripEditLogic } from "./logic";
import { styles } from "./styles";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TripsStackParamList } from "@/src/navigation/TripsNavigator";

type Props = NativeStackScreenProps<TripsStackParamList, "TripEdit">;

export default function TripEditScreen({ route, navigation }: Props) {
  const { form, set, submit, isSubmitting } = useTripEditLogic(
    route.params.id,
    navigation
  );

  if (!form) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Trip</Text>

      <TextInput
        style={styles.input}
        placeholder="Trip Number"
        value={form.trip_number}
        onChangeText={(v) => set("trip_number", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="A Code"
        value={form.a_code ?? ""}
        onChangeText={(v) => set("a_code", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="From"
        value={form.destination_from}
        onChangeText={(v) => set("destination_from", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="To"
        value={form.destination_to}
        onChangeText={(v) => set("destination_to", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Mileage"
        keyboardType="numeric"
        value={form.mileage?.toString() ?? ""}
        onChangeText={(v) => set("mileage", Number(v))}
      />

      <TextInput
        style={styles.input}
        placeholder="Driver description"
        value={form.driver_description ?? ""}
        onChangeText={(v) => set("driver_description", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Admin description"
        value={form.admin_description ?? ""}
        onChangeText={(v) => set("admin_description", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Invoice Number"
        value={form.invoice_number ?? ""}
        onChangeText={(v) => set("invoice_number", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={form.amount?.toString() ?? ""}
        onChangeText={(v) => set("amount", Number(v))}
      />

      {/* <Text style={{ marginTop: 8, marginBottom: 4 }}>Status</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Object.values(form.availableStatuses).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusOption,
              form.status === status && styles.statusOptionSelected,
            ]}
            onPress={() => set("status", status)}
          >
            <Text style={styles.statusText}>{status}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView> */}

      <TouchableOpacity
        style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
        onPress={submit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitText}>
          {isSubmitting ? "Updating..." : "Update"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
