import OfflineQueueScreen from '@/src/components/OfflineQueueScreen';
import { Dashboard } from '@/src/screens/Dashboard';
// import { LiveTracking } from '@/src/screens/LiveTracking';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerNavigationProp } from '@react-navigation/drawer';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { TripsNavigator } from '../TripsNavigator';
import { MainDrawerParamList } from '../types';
import { VehiclesNavigator } from '../VehiclesNavigator';
import { CustomDrawerContent } from './CustomDrawerContent';
import { getDrawerActiveBackgroundColor, makeThemedStyles, styles } from './styles';
import { useTheme } from 'react-native-paper';
import { ThemeToggleButton } from '@/src/components/ui/ThemeToggleButton';

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
    // LiveTracking: 'Live Tracking',
    OfflineQueue: 'Offline Queue',
  };
  return titles[routeName] ?? routeName;
};

/** Utility: handle header title press for nested navigation */
const handleHeaderTitlePress = (navigation: DrawerNavigationProp<MainDrawerParamList>, routeName: keyof MainDrawerParamList) => {
  // Only some Drawer screens are nested stack navigators.
  if (routeName === 'Vehicles') {
    navigation.navigate('Vehicles', { screen: 'VehiclesList' });
    return;
  }
  if (routeName === 'Trips') {
    navigation.navigate('Trips', { screen: 'TripsList' });
    return;
  }
};

/** Header title component */
const HeaderTitle: React.FC<HeaderTitleProps> = ({ navigation, routeName }) => {
  const title = getHeaderTitle(routeName);
  return (
    <TouchableOpacity
      onPress={() => handleHeaderTitlePress(navigation, routeName)}
      accessibilityRole="button"
      accessibilityLabel={`${title} (tap to go to list)`}
      accessibilityHint="Navigates to the main list screen for this section"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={styles.headerTitleText}>{title}</Text>
    </TouchableOpacity>
  );
};

export const MainNavigator: React.FC = () => {
  const theme = useTheme();
  const themedStyles = React.useMemo(() => makeThemedStyles(theme), [theme]);
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation, route }) => ({
        headerShown: true,
        headerStyle: themedStyles.headerStyle,
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: themedStyles.headerTitleText,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.menuButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            accessibilityHint="Opens the navigation drawer"
          >
            <MaterialCommunityIcons name="menu" size={28} color={theme.colors.onSurface} />
          </TouchableOpacity>
        ),
        headerTitle: () => <HeaderTitle navigation={navigation} routeName={route.name as keyof MainDrawerParamList} />,
        headerRight: () => <ThemeToggleButton />,
        sceneContainerStyle: themedStyles.sceneContainerStyle,
        drawerStyle: themedStyles.drawerStyle,
        drawerActiveBackgroundColor: getDrawerActiveBackgroundColor(),
        drawerInactiveTintColor: theme.colors.onSurfaceVariant,
        drawerActiveTintColor: theme.colors.primary,
      })}
    >
      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="Trips" component={TripsNavigator} />
      <Drawer.Screen name="Vehicles" component={VehiclesNavigator} />
      <Drawer.Screen name="OfflineQueue" component={OfflineQueueScreen} />
      {/* <Drawer.Screen name="LiveTracking" component={LiveTracking} /> */}
    </Drawer.Navigator>
  );
};
