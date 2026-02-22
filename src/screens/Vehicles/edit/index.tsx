import { View } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useEditVehicle } from "./logic";
import { VehiclesStackParamList } from "@/src/navigation/VehiclesNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "@/src/components/ui/Screen";
import { FadeIn } from "@/src/components/ui/FadeIn";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { Text, TextInput, Switch, ActivityIndicator, useTheme } from "react-native-paper";
import { useAuth } from "@/src/hooks/useAuth";
import { RoleFactory } from "@/src/roles";
import React, { useMemo } from "react";
import { makeStyles } from "./styles";

export default function EditVehicle() {
  const { id } = useRoute<any>().params;
  const navigation = useNavigation<NativeStackNavigationProp<VehiclesStackParamList, "VehicleEdit">>();

  const { form, setField, update, loading, error } = useEditVehicle({ id, navigation });
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { user } = useAuth();
  const roleHandler = RoleFactory.createFromUser({ roles: user?.roles });
  const canViewVehicles = roleHandler?.canViewVehicles?.() ?? false;

  if (!canViewVehicles) {
    return (
      <Screen accessibilityLabel="Edit vehicle restricted">
        <Text style={styles.restrictedText}>
          Editing vehicles is not available for your role.
        </Text>
        <PrimaryButton
          style={styles.restrictedButton}
          onPress={() => (navigation as any).navigate("Dashboard")}
          accessibilityLabel="Go to dashboard"
        >
          Back to Dashboard
        </PrimaryButton>
      </Screen>
    );
  }

  if (loading || !form)
    return (
      <Screen accessibilityLabel="Edit vehicle loading">
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Screen>
    );

  return (
    <Screen scroll accessibilityLabel="Edit vehicle">
      <FadeIn fromY={10}>
        <Text style={styles.title}>Edit Vehicle</Text>
        <Text style={styles.subtitle}>Update vehicle information.</Text>
      </FadeIn>

      <FadeIn fromY={12} durationMs={260} style={styles.formFade}>
        {!!error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput
          label="Registration number"
          value={form.registration_number}
          onChangeText={(v) => setField("registration_number", v)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Notes"
          value={form.notes}
          onChangeText={(v) => setField("notes", v)}
          mode="outlined"
          multiline
          style={styles.input}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Active</Text>
          <Switch value={form.is_active} onValueChange={(v) => setField("is_active", v)} />
        </View>

        <PrimaryButton onPress={update} accessibilityLabel="Update vehicle">
          Update
        </PrimaryButton>
      </FadeIn>
    </Screen>
  );
}
