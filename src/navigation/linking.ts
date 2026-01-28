import { LinkingOptions } from "@react-navigation/native";
import { RootStackParamList } from "./types";

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["myapp://", "https://myapp.com"],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Dashboard: "dashboard",
          Trips: "trips",
          Vehicles: "vehicles",
          //   Profile: 'profile',
        },
      },
      Auth: {
        screens: {
          SignIn: "signin",
        },
      },
    },
  },
};
