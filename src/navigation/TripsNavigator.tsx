import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TripCreateScreen from '@/src/screens/Trips/create';
import TripDetailsScreen from '@/src/screens/Trips/details';
import TripEditScreen from '@/src/screens/Trips/edit';
import TripsListScreen from '@/src/screens/Trips/list';

export type TripsStackParamList = {
  TripsList: undefined;
  TripDetails: { id: number };
  TripCreate: undefined;
  TripEdit: { id: number };
};

const Stack = createNativeStackNavigator<TripsStackParamList>();

export const TripsNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      headerStyle: { backgroundColor: '#fff' },
      headerTintColor: '#11181C',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen
      name="TripsList"
      component={TripsListScreen}
      options={{ title: 'Trips' }}
    />
    <Stack.Screen
      name="TripDetails"
      component={TripDetailsScreen}
      options={{ title: 'Trip Details' }}
    />
    <Stack.Screen
      name="TripCreate"
      component={TripCreateScreen}
      options={{ title: 'Create Trip' }}
    />
    <Stack.Screen
      name="TripEdit"
      component={TripEditScreen}
      options={{ title: 'Edit Trip' }}
    />
  </Stack.Navigator>
);
