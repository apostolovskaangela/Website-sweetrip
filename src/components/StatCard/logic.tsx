export const getTrendColor = (trendUp?: boolean) => {
    if (trendUp === undefined) return "#000";
    return trendUp ? "#bff2bf" : "#f7665e";
  };
  