import React from "react";
import Icon from "react-native-vector-icons/Feather";

interface TruckIconProps {
  size?: number;
  color?: string;
}

export const TruckIcon: React.FC<TruckIconProps> = ({ size = 24, color = "white" }) => {
  return <Icon name="truck" size={size} color={color} />;
};
