import React, { useMemo } from "react";
import { View } from "react-native";
import { makeStyles } from "./styles";
import { StatCardProps } from "../types";
import { Text, useTheme, Card } from "react-native-paper";

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp }) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  // Validate props
  const displayValue = value ?? "-";
  const displayTrend = trend ?? "";
  const trendStyle =
    trendUp === undefined ? styles.trendNeutral : trendUp ? styles.trendUp : styles.trendDown;

  return (
    <Card
      style={styles.card}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`${title}: ${displayValue}`}
    >
      <Card.Content>
        <View style={styles.header}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={styles.title}>{title}</Text>
        </View>

        <Text style={styles.value}>{displayValue}</Text>

        {displayTrend !== "" && <Text style={[styles.trend, trendStyle]}>{displayTrend}</Text>}
      </Card.Content>
    </Card>
  );
};
