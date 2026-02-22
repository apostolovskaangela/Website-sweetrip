import React, { useMemo } from "react";
import { useTripEditLogic } from "./logic";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TripsStackParamList } from "@/src/navigation/TripsNavigator";
import { Screen } from "@/src/components/ui/Screen";
import { FadeIn } from "@/src/components/ui/FadeIn";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { Text, TextInput, useTheme } from "react-native-paper";
import { makeStyles } from "./styles";

type Props = NativeStackScreenProps<TripsStackParamList, "TripEdit">;

export default function TripEditScreen({ route, navigation }: Props) {
  const { form, set, submit, isSubmitting } = useTripEditLogic(
    route.params.id,
    navigation
  );
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (!form) return null;

  return (
    <Screen scroll accessibilityLabel="Edit trip">
      <FadeIn fromY={10}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Edit Trip
        </Text>
        <Text style={styles.headerSubtitle}>
          Update trip details and save changes.
        </Text>
      </FadeIn>

      <FadeIn fromY={12} durationMs={260} style={styles.formFade}>
        <TextInput
          label="Trip number"
          value={form.trip_number}
          onChangeText={(v) => set("trip_number", v)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="A Code"
          value={form.a_code ?? ""}
          onChangeText={(v) => set("a_code", v)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="From"
          value={form.destination_from}
          onChangeText={(v) => set("destination_from", v)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="To"
          value={form.destination_to}
          onChangeText={(v) => set("destination_to", v)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Mileage (km)"
          keyboardType="numeric"
          value={form.mileage?.toString() ?? ""}
          onChangeText={(v) => set("mileage", Number(v))}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Driver description"
          value={form.driver_description ?? ""}
          onChangeText={(v) => set("driver_description", v)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Admin description"
          value={form.admin_description ?? ""}
          onChangeText={(v) => set("admin_description", v)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Invoice number"
          value={form.invoice_number ?? ""}
          onChangeText={(v) => set("invoice_number", v)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Amount"
          keyboardType="numeric"
          value={form.amount?.toString() ?? ""}
          onChangeText={(v) => set("amount", Number(v))}
          mode="outlined"
          style={styles.amountInput}
        />

        <PrimaryButton
          onPress={submit}
          disabled={isSubmitting}
          loading={isSubmitting}
          accessibilityLabel="Update trip"
        >
          {isSubmitting ? "Updating..." : "Update"}
        </PrimaryButton>
      </FadeIn>
    </Screen>
  );
}
