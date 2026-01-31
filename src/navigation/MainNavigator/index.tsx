import OfflineQueueScreen from '@/src/components/OfflineQueueScreen';
import { Dashboard } from '@/src/screens/Dashboard';
import { LiveTracking } from '@/src/screens/LiveTracking';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerNavigationProp } from '@react-navigation/drawer';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { TripsNavigator } from '../TripsNavigator';
import { MainDrawerParamList } from '../types';
import { VehiclesNavigator } from '../VehiclesNavigator';
import { CustomDrawerContent } from './CustomDrawerContent';
import { styles } from './styles';

type HeaderTitleProps = {
  navigation: DrawerNavigationProp<MainDrawerParamList>;
  routeName: keyof MainDrawerParamList;
};

const Drawer = createDrawerNavigator<MainDrawerParamList>();

/** Utility: map route names to display titles */
const getHeaderTitle = (routeName: keyof MainDrawerParamList) => {
  const titles: Record<keyof MainDrawerParamList, string> = {
    Dashboard: 'Dashboard',
    Trips: 'Trips',
    Vehicles: 'Vehicles',
    LiveTracking: 'Live Tracking',
  };
  return titles[routeName] ?? routeName;
};

/** Utility: handle header title press for nested navigation */
const handleHeaderTitlePress = (navigation: DrawerNavigationProp<MainDrawerParamList>, routeName: keyof MainDrawerParamList) => {
  const nestedScreens: Record<string, { screen: string }> = {
    Vehicles: { screen: 'VehiclesList' },
    Trips: { screen: 'TripsList' },
  };

  if (nestedScreens[routeName]) {
    navigation.navigate(routeName, nestedScreens[routeName]);
  }
};

/** Header title component */
const HeaderTitle: React.FC<HeaderTitleProps> = ({ navigation, routeName }) => {
  const title = getHeaderTitle(routeName);
  return (
    <TouchableOpacity onPress={() => handleHeaderTitlePress(navigation, routeName)}>
      <Text style={styles.headerTitleText}>{title}</Text>
    </TouchableOpacity>
  );
};

export const MainNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation, route }) => ({
        headerShown: true,
        headerStyle: styles.headerStyle,
        headerTintColor: '#11181C',
        headerTitleStyle: styles.headerTitleText,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.menuButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="menu" size={28} color="#11181C" />
          </TouchableOpacity>
        ),
        headerTitle: () => <HeaderTitle navigation={navigation} routeName={route.name as keyof MainDrawerParamList} />,
      })}
    >
      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="Trips" component={TripsNavigator} />
      <Drawer.Screen name="Vehicles" component={VehiclesNavigator} />
      <Drawer.Screen name="OfflineQueue" component={OfflineQueueScreen} />
      <Drawer.Screen name="LiveTracking" component={LiveTracking} />
    </Drawer.Navigator>
  );
};
