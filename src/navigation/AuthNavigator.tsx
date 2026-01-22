import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../components/Login';
import Signup from '../components/SignUp';



const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      {/* <Stack.Screen name="Signup" component={Signup} /> */}
    </Stack.Navigator>
  );
};
