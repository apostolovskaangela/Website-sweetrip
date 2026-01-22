import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useTripCreateLogic } from "./logic";
import { styles } from "./styles";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function TripCreateScreen({ navigation }: any) {
  const { form, set, submit, drivers, vehicles } =
    useTripCreateLogic(navigation);

  const [show, setShow] = useState(false);
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Trip</Text>

      <TextInput
        style={styles.input}
        placeholder="Trip Number"
        value={form.trip_number}
        onChangeText={(v) => set("trip_number", v)}
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
        placeholder="A Code"
        value={form.a_code}
        onChangeText={(v) => set("a_code", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Mileage"
        keyboardType="numeric"
        value={form.mileage?.toString() ?? ""}
        onChangeText={(v) => set("mileage", Number(v))}
      />

      <TouchableOpacity onPress={() => setShow(true)}>
      <Text style={styles.label}>Trip Date</Text>
        <TextInput
          style={styles.input}
          placeholder="Trip Date"
          editable={false}
          value={form.trip_date ?? ""}
        />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={form.trip_date ? new Date(form.trip_date) : new Date()}
          mode="date"
          display="calendar"
          onChange={(e, date) => {
            setShow(false);
            if (!date) return;

            // Convert to YYYY-MM-DD
            const formatted = date.toISOString().split("T")[0];

            set("trip_date", formatted);
          }}
        />
      )}

      {/* VEHICLE */}
      <Text style={styles.label}>Vehicle</Text>
      <Picker
        selectedValue={form.vehicle_id}
        onValueChange={(value) => set("vehicle_id", value)}
      >
        <Picker.Item label="Select vehicle" value={0} />
        {vehicles.map((v) => (
          <Picker.Item key={v.id} label={v.registration_number} value={v.id} />
        ))}
      </Picker>

      {/* DRIVER */}
      <Text style={styles.label}>Driver</Text>
      <Picker
        selectedValue={form.driver_id}
        onValueChange={(value) => set("driver_id", value)}
      >
        <Picker.Item label="Select driver" value={0} />
        {drivers.map((d) => (
          <Picker.Item key={d.id} label={d.name} value={d.id} />
        ))}
      </Picker>

      {/* DRIVER DESCRIPTION (notification content) */}
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Driver instructions / notes"
        multiline
        value={form.driver_description}
        onChangeText={(v) => set("driver_description", v)}
      />

      {/* ADMIN / MANAGER ONLY */}
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Internal admin / manager notes"
        multiline
        value={form.admin_description}
        onChangeText={(v) => set("admin_description", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Invoice Number"
        value={form.invoice_number}
        onChangeText={(v) => set("invoice_number", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={form.amount?.toString() ?? ""}
        onChangeText={(v) => set("amount", Number(v))}
      />

      <TouchableOpacity style={styles.submitBtn} onPress={submit}>
        <Text style={styles.submitText}>Create</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
