import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { MainDrawerParamList } from "../types";
import { useAuth } from "@/src/hooks/useAuth";
import { styles } from "./styles";

type DrawerContentProps = DrawerContentComponentProps;

const menuItems = [
  {
    name: "Dashboard" as keyof MainDrawerParamList,
    label: "Dashboard",
    icon: "view-dashboard",
  },
  {
    name: "Trips" as keyof MainDrawerParamList,
    label: "Trips",
    icon: "map-marker-path",
  },
  {
    name: "Vehicles" as keyof MainDrawerParamList,
    label: "Vehicles",
    icon: "truck",
  },
  {
    name: "LiveTracking" as keyof MainDrawerParamList,
    label: "Live Tracking",
    icon: "map-marker-radius",
  },
];

export const CustomDrawerContent = (props: DrawerContentProps) => {
  const currentRoute = props.state.routes[props.state.index].name;
  const { logout } = useAuth();

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Sweetrip</Text>
        <Text style={styles.drawerSubtitle}>Fleet Management</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => {
          const isActive = currentRoute === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => {
                if (item.name === "Vehicles") {
                  props.navigation.navigate("Vehicles", {
                    screen: "VehiclesList",
                  });
                } else if (item.name === "Trips") {
                  props.navigation.navigate("Trips", { screen: "TripsList" });
                } else {
                  props.navigation.navigate(item.name);
                }
                props.navigation.closeDrawer();
              }}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={24}
                color={isActive ? "#0a7ea4" : "#687076"}
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
          onPress={async () => {
            await logout();
            props.navigation.closeDrawer();
          }}
        >
          <MaterialCommunityIcons
            name="logout"
            size={24}
            color="#d32f2f"
            style={styles.menuIcon}
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};


