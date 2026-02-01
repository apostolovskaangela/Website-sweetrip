import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "./styles";
import { useTripCreateLogic, CreateTripForm } from "./logic";

type TripCreateScreenProps = {
  navigation: any;
};

export default function TripCreateScreen({
  navigation,
}: TripCreateScreenProps) {
  const { form, setField, submit, drivers, vehicles } = useTripCreateLogic();

  const [showDatePicker, setShowDatePicker] = useState(false);

  // Handle form submission
  const handleSubmit = async () => {
    const newTrip = await submit();
    if (newTrip) {
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>Create Trip</Text>

      {/* Trip Number */}
      <TextInput
        style={styles.input}
        placeholder="Trip Number"
        value={form.trip_number}
        onChangeText={(v) => setField("trip_number", v)}
      />

      {/* From / To */}
      <TextInput
        style={styles.input}
        placeholder="From"
        value={form.destination_from}
        onChangeText={(v) => setField("destination_from", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="To"
        value={form.destination_to}
        onChangeText={(v) => setField("destination_to", v)}
      />

      {/* A Code */}
      <TextInput
        style={styles.input}
        placeholder="A Code"
        value={form.a_code}
        onChangeText={(v) => setField("a_code", v)}
      />

      {/* Mileage */}
      <TextInput
        style={styles.input}
        placeholder="Mileage"
        keyboardType="numeric"
        value={form.mileage?.toString() ?? ""}
        onChangeText={(v) => setField("mileage", Number(v))}
      />

      {/* Trip Date */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={styles.label}>Trip Date</Text>
        <TextInput
          style={styles.input}
          placeholder="Trip Date"
          editable={false}
          value={form.trip_date}
        />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={form.trip_date ? new Date(form.trip_date) : new Date()}
          mode="date"
          display="calendar"
          onChange={(e, date) => {
            setShowDatePicker(false);
            if (!date) return;
            setField("trip_date", date.toISOString().split("T")[0]);
          }}
        />
      )}

      {/* Vehicle Picker */}
      <Text style={styles.label}>Vehicle</Text>
      <Picker
        selectedValue={form.vehicle_id}
        onValueChange={(v) => setField("vehicle_id", Number(v))}
      >
        <Picker.Item label="Select vehicle" value={0} />
        {vehicles.map((v) => (
          <Picker.Item key={v.id} label={v.registration_number} value={v.id} />
        ))}
      </Picker>

      {/* Driver Picker */}
      <Text style={styles.label}>Driver</Text>
      <Picker
        selectedValue={form.driver_id}
        onValueChange={(v) => setField("driver_id", Number(v))}
      >
        <Picker.Item label="Select driver" value={0} />
        {drivers.map((d) => (
          <Picker.Item key={d.id} label={d.name} value={d.id} />
        ))}
      </Picker>

      {/* Notes */}
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Driver instructions / notes"
        multiline
        value={form.driver_description}
        onChangeText={(v) => setField("driver_description", v)}
      />

      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Internal admin / manager notes"
        multiline
        value={form.admin_description}
        onChangeText={(v) => setField("admin_description", v)}
      />

      {/* Invoice & Amount */}
      <TextInput
        style={styles.input}
        placeholder="Invoice Number"
        value={form.invoice_number}
        onChangeText={(v) => setField("invoice_number", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={form.amount?.toString() ?? ""}
        onChangeText={(v) => setField("amount", Number(v))}
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Create</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
