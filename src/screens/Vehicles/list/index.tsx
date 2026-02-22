// src/screens/Vehicles/list/index.tsx
import { listVirtualizationConfig } from "@/src/lib/listConfig";
import { VehiclesStackParamList } from "@/src/navigation/VehiclesNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import type { Vehicle } from "../types";
import { useVehicles } from "./logic";
import { Screen } from "@/src/components/ui/Screen";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { Text, useTheme } from "react-native-paper";
import { FadeIn } from "@/src/components/ui/FadeIn";
import { useAuth } from "@/src/hooks/useAuth";
import { RoleFactory } from "@/src/roles";
import { makeStyles } from "./styles";

export default function VehicleList() {
  const nav = useNavigation<
    NativeStackNavigationProp<VehiclesStackParamList, "VehiclesList">
  >();
  const { vehicles, loading, error, reload } = useVehicles();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { user } = useAuth();
  const roleHandler = RoleFactory.createFromUser({ roles: user?.roles });
  const canViewVehicles = roleHandler?.canViewVehicles?.() ?? false;

  const keyExtractor = useCallback((v: Vehicle) => v.id.toString(), []);
  const onPressVehicle = useCallback(
    (id: number) => nav.navigate("VehicleDetails", { id }),
    [nav]
  );
  const renderItem = useCallback(
    ({ item, index }: { item: Vehicle; index: number }) => (
      <FadeIn fromY={10} durationMs={220 + Math.min(index, 6) * 30}>
        <VehicleCard item={item} onPressVehicle={onPressVehicle} />
      </FadeIn>
    ),
    [onPressVehicle]
  );
  const onPressCreate = useCallback(
    () => nav.navigate("VehicleCreate"),
    [nav]
  );

  const canCreate = canViewVehicles;

  // Drivers should not access Vehicles screens at all (Dashboard-only visibility).
  if (!canViewVehicles) {
    return (
      <Screen accessibilityLabel="Vehicles not available">
        <Text style={styles.restrictedText}>
          Vehicles are not available for your role. You can view vehicle status on the Dashboard.
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

  if (loading) return <ActivityIndicator style={styles.loading} size="large" color={theme.colors.primary} />;

  if (error)
    return (
      <Screen accessibilityLabel="Vehicles error">
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <PrimaryButton onPress={() => reload()} accessibilityLabel="Retry loading vehicles">
            Retry
          </PrimaryButton>
        </View>
      </Screen>
    );

  return (
    <Screen accessibilityLabel="Vehicles list">
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Vehicles</Text>
          <Text style={styles.subtitle}>See all your vehicles</Text>
        </View>

        {canCreate && (
          <PrimaryButton
            icon="plus"
            onPress={onPressCreate}
            accessibilityLabel="Create new vehicle"
            contentStyle={styles.newButtonContent}
          >
            New
          </PrimaryButton>
        )}
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        {...listVirtualizationConfig}
      />
    </Screen>
  );
}

interface VehicleCardProps {
  item: Vehicle;
  onPressVehicle: (id: number) => void;
}

const VehicleCard = React.memo<VehicleCardProps>(function VehicleCard({
  item,
  onPressVehicle,
}) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const onPress = useCallback(
    () => onPressVehicle(item.id),
    [onPressVehicle, item.id]
  );
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Vehicle ${item.registration_number ?? "unknown registration"}`}
      accessibilityHint="Opens vehicle details"
    >
      <View style={styles.card}>
        <Text style={styles.regNumber}>{item.registration_number}</Text>
        <Text style={item.is_active ? styles.activeText : styles.inactiveText}>
          {item.is_active ? "Active" : "Inactive"}
        </Text>
        {!!item.notes && (
          <Text style={styles.notesText}>{item.notes}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
});
