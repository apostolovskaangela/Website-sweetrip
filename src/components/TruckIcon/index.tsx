import React from "react";
import Icon from "react-native-vector-icons/Feather";
import { getDefaultTruckIconProps } from "./logic";
import { TruckIconProps } from "../types";

export const TruckIcon: React.FC<TruckIconProps> = (props) => {
  const { size, color } = { ...getDefaultTruckIconProps(), ...props };

  return <Icon name="truck" size={size} color={color} />;
};
