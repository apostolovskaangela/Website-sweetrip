import { Vehicle } from "../types";

export type StatusColor = {
  backgroundColor: string;
  textColor: string;
  label: string;
};

export function getVehicleStatusBadge(vehicle: Vehicle): StatusColor {
  if (vehicle.is_active) {
    return {
      backgroundColor: "#bff2bf", // green bg
      textColor: "#0a821c",       // green text
      label: "Active",
    };
  } else {
    return {
      backgroundColor: "#f7665e", // red bg
      textColor: "#940303",       // red text
      label: "Inactive",
    };
  }
}
