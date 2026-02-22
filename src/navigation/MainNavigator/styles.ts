import { safeAreaBottomInset } from "@/src/config/platform";
import { cardShadow, headerShadow } from "@/src/utils/platformStyles";
import { StyleSheet } from "react-native";
import type { MD3Theme } from "react-native-paper";

export const styles = StyleSheet.create({
  tabBar: {
    height: 70 + safeAreaBottomInset,
    backgroundColor: "#fff",
    borderTopWidth: 0,
    paddingBottom: safeAreaBottomInset,
    ...cardShadow(5),
  },
  badgeContainer: {
    position: "absolute",
    top: -5,
    right: -10,
    backgroundColor: "red",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  drawerContent: {
    flex: 1,
    backgroundColor: "#fff",
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#11181C",
    marginBottom: 4,
  },
  drawerSubtitle: {
    fontSize: 14,
    color: "#687076",
  },
  menuContainer: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 2,
  },
  menuItemActive: {
    backgroundColor: "#e3f2fd",
    borderLeftWidth: 4,
    borderLeftColor: "#0a7ea4",
  },
  menuIcon: {
    marginRight: 16,
    color: "#001F3F",
    fontSize: 24,
  },
  menuLabel: {
    fontSize: 16,
    color: "#001F3F",
  },
  menuLabelActive: {
    color: "#001F3F",
    fontWeight: "600",
  },
  logoutContainer: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingVertical: 10,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },

  logoutText: {
    fontSize: 16,
    color: "#d32f2f",
    fontWeight: "600",
  },

  headerStyle: {
    backgroundColor: '#fff',
    ...headerShadow(),
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#11181C',
  },
  menuButton: {
    marginLeft: 16,
    padding: 8,
  },
  
});

/**
 * Theme-aware colors for the drawer/header.
 * We keep layout in `styles` and apply colors dynamically in components.
 */
export const NAV_DEFAULTS = {
  activeIndicatorOpacity: 0.12,
} as const;

export const makeThemedStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    headerStyle: {
      backgroundColor: theme.colors.elevation.level1,
      ...headerShadow(),
    },
    headerTitleText: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    sceneContainerStyle: {
      backgroundColor: theme.colors.background,
    },
    drawerStyle: {
      backgroundColor: theme.colors.background,
    },
  });

export function getDrawerActiveBackgroundColor() {
  return `rgba(10,126,164,${NAV_DEFAULTS.activeIndicatorOpacity})`;
}
