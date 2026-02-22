import { LinkingOptions } from "@react-navigation/native";
import { RootStackParamList } from "./types";

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["sweetrip://"],
  config: {
    screens: {
      Welcome: "welcome",
      Login: "login",
      Dashboard: {
        screens: {
          Dashboard: "dashboard",
          Trips: {
            screens: {
              TripsList: "trips",
              TripDetails: "trips/:id",
              TripCreate: "trips/new",
              TripEdit: "trips/:id/edit",
            },
          },
          Vehicles: {
            screens: {
              VehiclesList: "vehicles",
              VehicleDetails: "vehicles/:id",
              VehicleCreate: "vehicles/new",
              VehicleEdit: "vehicles/:id/edit",
            },
          },
          // LiveTracking: "live-tracking",
          OfflineQueue: "offline-queue",
        },
      },
    },
  },
};
