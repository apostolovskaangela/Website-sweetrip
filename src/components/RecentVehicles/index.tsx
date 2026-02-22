import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import type { Vehicle } from "../types";
import { getVehicleStatusBadge } from "./logic";
import { makeStyles, statusBadgeBg, statusTextColor } from "./styles";
import { Text, useTheme } from "react-native-paper";
import { useAuth } from "@/src/hooks/useAuth";
import { RoleFactory } from "@/src/roles";

interface VehicleStatusProps {
  vehicles: Vehicle[];
}

export const VehicleStatus: React.FC<VehicleStatusProps> = ({ vehicles = [] }) => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { user } = useAuth();
  const roleHandler = RoleFactory.createFromUser({ roles: user?.roles });
  const canViewVehicles = roleHandler?.canViewVehicles?.() ?? false;

  const onPressVehicle = useCallback(
    (id: number) =>
      navigation.navigate("Vehicles", {
        screen: "VehicleDetails",
        params: { id },
      }),
    [navigation]
  );

  if (!vehicles.length) {
    return <Text style={styles.emptyText}>No vehicles available</Text>;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Vehicle Status</Text>
      {vehicles.map((v) => (
        <RecentVehicleCard
          key={v.id}
          item={v}
          onPress={canViewVehicles ? () => onPressVehicle(v.id) : undefined}
        />
      ))}
    </View>
  );
};

interface RecentVehicleCardProps {
  item: Vehicle;
  onPress?: () => void;
}

const RecentVehicleCard = React.memo<RecentVehicleCardProps>(function RecentVehicleCard({
  item,
  onPress,
}) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const badge = getVehicleStatusBadge(item);
  const CardWrapper: any = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`Vehicle ${item.registration_number ?? "No registration"}`}
      accessibilityHint={onPress ? "Opens vehicle details" : "Vehicles are view-only for your role"}
    >
      <View
        style={[styles.card, !onPress && styles.cardDisabled]}
      >
        <Text style={styles.cardTitle}>{item.registration_number ?? "No registration"}</Text>
        <View
          style={[
            styles.statusBadge,
            statusBadgeBg(badge.backgroundColor),
          ]}
        >
          <Text style={[styles.statusText, statusTextColor(badge.textColor)]}>
            {badge.label}
          </Text>
        </View>
      </View>
    </CardWrapper>
  );
});
