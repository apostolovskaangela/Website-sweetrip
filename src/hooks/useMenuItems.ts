import { useMemo } from "react";
import { RoleFactory } from "@/src/roles";
import { useAuth } from "@/src/hooks/useAuth";
import { MainDrawerParamList } from "../navigation/types";

export type MenuItem = {
  name: keyof MainDrawerParamList;
  label: string;
  icon: keyof typeof import("@expo/vector-icons/build/MaterialCommunityIcons").default.glyphMap;
};

const BASE_MENU: MenuItem[] = [
  { name: "Dashboard", label: "Dashboard", icon: "view-dashboard" },
  { name: "Trips", label: "Trips", icon: "map-marker-path" },
  { name: "Vehicles", label: "Vehicles", icon: "truck" },
  { name: "LiveTracking", label: "Live Tracking", icon: "map-marker-radius" },
];

export function useMenuItems() {
  const { user } = useAuth();

  const roleHandler = useMemo(() => {
    if (!user) return null;
    return RoleFactory.createFromUser({ roles: user.roles });
  }, [user]);

  const menuItems = useMemo(() => {
    return BASE_MENU.filter((item) => {
      if (item.name === "Vehicles") {
        return roleHandler?.canViewVehicles?.() ?? false;
      }
      return true;
    });
  }, [roleHandler]);

  return menuItems;
}
