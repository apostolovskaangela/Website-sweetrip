import { View } from "react-native";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useVehicleDetails } from "./logic";
import { VehiclesStackParamList } from "@/src/navigation/VehiclesNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { Screen } from "@/src/components/ui/Screen";
import { FadeIn } from "@/src/components/ui/FadeIn";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { Text, ActivityIndicator, useTheme } from "react-native-paper";
import { useAuth } from "@/src/hooks/useAuth";
import { RoleFactory } from "@/src/roles";
import React, { useMemo } from "react";
import { makeStyles } from "./styles";

type VehicleDetailsNavProp = NativeStackNavigationProp<VehiclesStackParamList, "VehicleDetails">;
type VehicleDetailsRouteProp = RouteProp<VehiclesStackParamList, "VehicleDetails">;

export default function VehicleDetails() {
  const nav = useNavigation<VehicleDetailsNavProp>();
  const { id } = useRoute<VehicleDetailsRouteProp>().params;
  const { vehicle, loadVehicle, loading, error } = useVehicleDetails(id);
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { user } = useAuth();
  const roleHandler = RoleFactory.createFromUser({ roles: user?.roles });
  const canViewVehicles = roleHandler?.canViewVehicles?.() ?? false;

  useFocusEffect(
    useCallback(() => {
      loadVehicle();
    }, [id])
  );

  if (!canViewVehicles) {
    return (
      <Screen accessibilityLabel="Vehicle details restricted">
        <Text style={styles.restrictedText}>
          Vehicle details are not available for your role.
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

  if (loading)
    return (
      <Screen accessibilityLabel="Vehicle loading">
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Screen>
    );
  if (error)
    return (
      <Screen accessibilityLabel="Vehicle error">
        <Text style={styles.errorText}>{error}</Text>
      </Screen>
    );
  if (!vehicle)
    return (
      <Screen accessibilityLabel="Vehicle not found">
        <Text style={styles.notFoundText}>Vehicle not found</Text>
      </Screen>
    );

  return (
    <Screen scroll accessibilityLabel="Vehicle details">
      <FadeIn fromY={10}>
        <Text style={styles.title}>{vehicle.registration_number}</Text>
        <Text style={vehicle.is_active ? styles.activeStatus : styles.inactiveStatus}>
          {vehicle.is_active ? "Active" : "Inactive"}
        </Text>
      </FadeIn>

      <FadeIn fromY={12} durationMs={260} style={styles.formFade}>
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Notes</Text>
          <Text style={styles.notesBody}>{vehicle.notes || "No notes"}</Text>
        </View>

        <PrimaryButton
          onPress={() => nav.navigate("VehicleEdit", { id })}
          accessibilityLabel="Edit vehicle"
          style={styles.editButton}
        >
          Edit
        </PrimaryButton>
      </FadeIn>
    </Screen>
  );
}
