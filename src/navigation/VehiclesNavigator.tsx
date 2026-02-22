import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import VehiclesListScreen from '@/src/screens/Vehicles/list';
import VehicleDetailsScreen from '@/src/screens/Vehicles/details';
import VehicleCreateScreen from '@/src/screens/Vehicles/create';
import VehicleEditScreen from '@/src/screens/Vehicles/edit';
import { useAuth } from '@/src/hooks/useAuth';
import { RoleFactory } from '@/src/roles';
import { Screen } from '@/src/components/ui/Screen';
import { Text, useTheme } from 'react-native-paper';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { space } from '@/src/theme/tokens';

// Navigation params
export type VehiclesStackParamList = {
  VehiclesList: undefined;
  VehicleDetails: { id: number };
  VehicleCreate: undefined;
  VehicleEdit: { id: number };
};

const Stack = createNativeStackNavigator<VehiclesStackParamList>();

const VehiclesNotAllowed: React.FC = () => {
  const nav = useNavigation<any>();
  const theme = useTheme();

  return (
    <Screen accessibilityLabel="Vehicles not available">
      <View style={{ marginTop: space.lg }}>
        <Text style={{ fontWeight: '900', fontSize: 20, color: theme.colors.onBackground }}>
          Vehicles
        </Text>
        <Text style={{ marginTop: 6, color: theme.colors.onSurfaceVariant }}>
          Vehicles are view-only for drivers and can only be seen on the Dashboard list.
        </Text>
      </View>

      <PrimaryButton
        style={{ marginTop: space.lg }}
        onPress={() => nav.navigate('Dashboard')}
        accessibilityLabel="Go to dashboard"
      >
        Back to Dashboard
      </PrimaryButton>
    </Screen>
  );
};

export const VehiclesNavigator: React.FC = () => {
  const { user } = useAuth();
  const roleHandler = RoleFactory.createFromUser({ roles: user?.roles });
  const canViewVehicles = roleHandler?.canViewVehicles?.() ?? false;

  if (!canViewVehicles) return <VehiclesNotAllowed />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VehiclesList" component={VehiclesListScreen} options={{ title: 'Vehicles' }} />
      <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} options={{ title: 'Vehicle Details' }} />
      <Stack.Screen name="VehicleCreate" component={VehicleCreateScreen} options={{ title: 'Create Vehicle' }} />
      <Stack.Screen name="VehicleEdit" component={VehicleEditScreen} options={{ title: 'Edit Vehicle' }} />
    </Stack.Navigator>
  );
};
