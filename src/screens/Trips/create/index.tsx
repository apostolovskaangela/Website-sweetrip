import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTripCreateLogic } from "./logic";
import { Screen } from "@/src/components/ui/Screen";
import { FadeIn } from "@/src/components/ui/FadeIn";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { Text, TextInput, useTheme } from "react-native-paper";
import { makeStyles } from "./styles";

type TripCreateScreenProps = {
  navigation: any;
};

export default function TripCreateScreen({
  navigation,
}: TripCreateScreenProps) {
  const { form, setField, submit, drivers, vehicles } = useTripCreateLogic();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [showDatePicker, setShowDatePicker] = useState(false);

  // Handle form submission
  const handleSubmit = async () => {
    const newTrip = await submit();
    if (newTrip) {
      navigation.goBack();
    }
  };

  return (
    <Screen scroll accessibilityLabel="Create trip">
      <FadeIn fromY={10}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Create Trip
        </Text>
        <Text style={styles.headerSubtitle}>
          Fill in the details below to dispatch a trip.
        </Text>
      </FadeIn>

      <FadeIn fromY={12} durationMs={260} style={styles.formFade}>
        <TextInput
          label="Trip number"
          value={form.trip_number}
          onChangeText={(v) => setField("trip_number", v)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="From"
          value={form.destination_from}
          onChangeText={(v) => setField("destination_from", v)}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="To"
          value={form.destination_to}
          onChangeText={(v) => setField("destination_to", v)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="A Code"
          value={form.a_code}
          onChangeText={(v) => setField("a_code", v)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Mileage (km)"
          keyboardType="numeric"
          value={form.mileage?.toString() ?? ""}
          onChangeText={(v) => setField("mileage", Number(v))}
          mode="outlined"
          style={styles.input}
        />

        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>
            Trip date
          </Text>
          <PrimaryButton
            onPress={() => setShowDatePicker(true)}
            accessibilityLabel="Choose trip date"
            style={styles.dateButton}
          >
            {form.trip_date ? form.trip_date : "Select date"}
          </PrimaryButton>
        </View>

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

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Vehicle</Text>
          <Picker selectedValue={form.vehicle_id} onValueChange={(v) => setField("vehicle_id", Number(v))}>
            <Picker.Item label="Select vehicle" value={0} />
            {vehicles.map((v) => (
              <Picker.Item key={v.id} label={v.registration_number} value={v.id} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Driver</Text>
          <Picker selectedValue={form.driver_id} onValueChange={(v) => setField("driver_id", Number(v))}>
            <Picker.Item label="Select driver" value={0} />
            {drivers.map((d) => (
              <Picker.Item key={d.id} label={d.name} value={d.id} />
            ))}
          </Picker>
        </View>

        <TextInput
          label="Driver instructions / notes"
          multiline
          value={form.driver_description}
          onChangeText={(v) => setField("driver_description", v)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Internal admin / manager notes"
          multiline
          value={form.admin_description}
          onChangeText={(v) => setField("admin_description", v)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Invoice number"
          value={form.invoice_number}
          onChangeText={(v) => setField("invoice_number", v)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Amount"
          keyboardType="numeric"
          value={form.amount?.toString() ?? ""}
          onChangeText={(v) => setField("amount", Number(v))}
          mode="outlined"
          style={styles.amountInput}
        />

        <PrimaryButton onPress={handleSubmit} accessibilityLabel="Create trip">
          Create
        </PrimaryButton>
      </FadeIn>
    </Screen>
  );
}
