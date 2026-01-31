// VehiclesNavigator.tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import VehiclesListScreen from '@/src/screens/Vehicles/list';
import VehicleDetailsScreen from '@/src/screens/Vehicles/details';
import VehicleCreateScreen from '@/src/screens/Vehicles/create';
import VehicleEditScreen from '@/src/screens/Vehicles/edit';

// Navigation params
export type VehiclesStackParamList = {
  VehiclesList: undefined;
  VehicleDetails: { id: number };
  VehicleCreate: undefined;
  VehicleEdit: { id: number };
};

const Stack = createNativeStackNavigator<VehiclesStackParamList>();

export const VehiclesNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={({ navigation }) => ({
      headerShown: false,
      headerStyle: { backgroundColor: '#fff' },
      headerTintColor: '#11181C',
      headerTitleStyle: { fontWeight: 'bold' },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={{ marginLeft: 16, padding: 8 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="menu" size={28} color="#11181C" />
        </TouchableOpacity>
      ),
    })}
  >
    <Stack.Screen
      name="VehiclesList"
      component={VehiclesListScreen}
      options={{ title: 'Vehicles' }}
    />
    <Stack.Screen
      name="VehicleDetails"
      component={VehicleDetailsScreen}
      options={{ title: 'Vehicle Details' }}
    />
    <Stack.Screen
      name="VehicleCreate"
      component={VehicleCreateScreen}
      options={{ title: 'Create Vehicle' }}
    />
    <Stack.Screen
      name="VehicleEdit"
      component={VehicleEditScreen}
      options={{ title: 'Edit Vehicle' }}
    />
  </Stack.Navigator>
);
