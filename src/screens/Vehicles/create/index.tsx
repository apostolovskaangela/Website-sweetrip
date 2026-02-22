// src/screens/Vehicles/create/index.tsx
import React, { useMemo } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCreateVehicle } from "./logic";
import { Screen } from "@/src/components/ui/Screen";
import { FadeIn } from "@/src/components/ui/FadeIn";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { Text, TextInput, Switch, useTheme } from "react-native-paper";
import { useAuth } from "@/src/hooks/useAuth";
import { RoleFactory } from "@/src/roles";
import { makeStyles } from "./styles";

export default function CreateVehicle() {
  const nav = useNavigation();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { user } = useAuth();
  const roleHandler = RoleFactory.createFromUser({ roles: user?.roles });
  const canViewVehicles = roleHandler?.canViewVehicles?.() ?? false;
  const {
    registrationNumber,
    setRegistrationNumber,
    notes,
    setNotes,
    isActive,
    setIsActive,
    submit,
    loading,
    error,
  } = useCreateVehicle();

  const handleSubmit = async () => {
    const vehicle = await submit();
    if (vehicle) nav.goBack();
  };

  if (!canViewVehicles) {
    return (
      <Screen accessibilityLabel="Create vehicle restricted">
        <Text style={styles.restrictedText}>
          Creating vehicles is not available for your role.
        </Text>
        <PrimaryButton
          style={styles.restrictedButton}
          onPress={() => (nav as any).navigate("Dashboard")}
          accessibilityLabel="Go to dashboard"
        >
          Back to Dashboard
        </PrimaryButton>
      </Screen>
    );
  }

  return (
    <Screen scroll accessibilityLabel="Create vehicle">
      <FadeIn fromY={10}>
        <Text style={styles.title}>Create Vehicle</Text>
        <Text style={styles.subtitle}>Add a new vehicle to your fleet.</Text>
      </FadeIn>

      <FadeIn fromY={12} durationMs={260} style={styles.formFade}>
        {!!error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput
          label="Registration number"
          value={registrationNumber}
          onChangeText={setRegistrationNumber}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          multiline
          style={styles.input}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Active</Text>
          <Switch value={isActive} onValueChange={setIsActive} />
        </View>

        <PrimaryButton
          onPress={handleSubmit}
          disabled={loading}
          loading={loading}
          accessibilityLabel="Create vehicle"
        >
          {loading ? "Creating..." : "Create Vehicle"}
        </PrimaryButton>
      </FadeIn>
    </Screen>
  );
}
