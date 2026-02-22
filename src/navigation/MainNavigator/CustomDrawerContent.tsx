import OfflineIndicator from '@/src/components/OfflineIndicator';
import { useAuth } from "@/src/hooks/useAuth";
import { MenuItem, useMenuItems } from "@/src/hooks/useMenuItems";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
} from "@react-navigation/drawer";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";
import { useTheme } from "react-native-paper";

export const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (
  props
) => {
  const currentRoute = props.state.routes[props.state.index].name;
  const { logout } = useAuth();
  const menuItems = useMenuItems();
  const theme = useTheme();

  const handleNavigation = (item: MenuItem) => {
    if (item.name === "Vehicles") {
      props.navigation.navigate("Vehicles", { screen: "VehiclesList" });
    } else if (item.name === "Trips") {
      props.navigation.navigate("Trips", { screen: "TripsList" });
    } else {
      props.navigation.navigate(item.name);
    }
    props.navigation.closeDrawer();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      props.navigation.closeDrawer();
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      style={[styles.drawerContent, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[
          styles.drawerHeader,
          { borderBottomColor: theme.colors.outline },
        ]}
      >
        <Text style={[styles.drawerTitle, { color: theme.colors.onSurface }]}>Sweetrip</Text>
        <Text style={[styles.drawerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Fleet Management
        </Text>
        <OfflineIndicator onPress={() => props.navigation.navigate('OfflineQueue')} />
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => {
          const isActive = currentRoute === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => handleNavigation(item)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityHint={`Navigates to ${item.label}`}
              accessibilityState={{ selected: isActive }}
            >
              <MaterialCommunityIcons
                name={item.icon}
                style={[styles.menuIcon, { color: isActive ? theme.colors.primary : theme.colors.onSurfaceVariant }]}
              />
              <Text
                style={[
                  styles.menuLabel,
                  { color: isActive ? theme.colors.onSurface : theme.colors.onSurfaceVariant },
                  isActive && styles.menuLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Logout"
          accessibilityHint="Logs you out of the application"
        >
          <MaterialCommunityIcons
            name="logout"
            style={[styles.menuIcon, { color: theme.colors.error }]}
          />
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};
