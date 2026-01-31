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

export const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (
  props
) => {
  const currentRoute = props.state.routes[props.state.index].name;
  const { logout } = useAuth();
  const menuItems = useMenuItems();

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
    <DrawerContentScrollView {...props} style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Sweetrip</Text>
        <Text style={styles.drawerSubtitle}>Fleet Management</Text>
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
            >
              <MaterialCommunityIcons
                name={item.icon}
                style={styles.menuIcon}
              />
              <Text
                style={[styles.menuLabel, isActive && styles.menuLabelActive]}
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
        >
          <MaterialCommunityIcons
            name="logout"
            style={styles.menuIcon}
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};
