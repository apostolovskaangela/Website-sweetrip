import { useMemo } from "react";
import { RoleFactory } from "@/src/roles";
import { useAuth } from "@/src/hooks/useAuth";
import { useIsOffline } from "@/src/hooks/useIsOffline";
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
  // { name: "LiveTracking", label: "Live Tracking", icon: "map-marker-radius" },
];

export function useMenuItems() {
  const { user } = useAuth();
  const isOffline = useIsOffline();

  const roleHandler = useMemo(() => {
    if (!user) return null;
    return RoleFactory.createFromUser({ roles: user.roles });
  }, [user]);

  const menuItems = useMemo(() => {
    const base = BASE_MENU.filter((item) => {
      if (item.name === "Vehicles") {
        return roleHandler?.canViewVehicles?.() ?? false;
      }
      return true;
    });
    if (!isOffline) return base;
    const offlineItem: MenuItem = {
      name: "OfflineQueue",
      label: "Offline Queue",
      icon: "cloud-off-outline",
    };
    return [...base.slice(0, 3), offlineItem, ...base.slice(3)];
  }, [isOffline, roleHandler]);

  return menuItems;
}
