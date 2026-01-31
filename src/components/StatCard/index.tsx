import React from "react";
import { View, Text } from "react-native";
import { Card } from "react-native-paper";
import { styles } from "./styles";
import { getTrendColor } from "./logic";
import { StatCardProps } from "../types";

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp }) => {
  // Validate props
  const displayValue = value ?? "-";
  const displayTrend = trend ?? "";

  return (
    <Card style={styles.statCard}>
      <Card.Content>
        <View style={styles.statCardHeader}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={styles.statCardTitle}>{title}</Text>
        </View>

        <Text style={styles.statCardValue}>{displayValue}</Text>

        {displayTrend !== "" && (
          <Text style={[styles.statCardTrend, { color: getTrendColor(trendUp) }]}>
            {displayTrend}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};
