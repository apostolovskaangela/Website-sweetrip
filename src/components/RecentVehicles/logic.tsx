import { Vehicle } from "../types";

export type StatusColor = {
  backgroundColor: string;
  textColor: string;
  label: string;
};

export function getVehicleStatusBadge(vehicle: Vehicle): StatusColor {
  if (vehicle.is_active) {
    return {
      backgroundColor: "#bff2bf", // green 
      textColor: "#0a821c",       // green 
      label: "Active",
    };
  } else {
    return {
      backgroundColor: "#f7665e", // red 
      textColor: "#940303",       // red 
      label: "Inactive",
    };
  }
}
