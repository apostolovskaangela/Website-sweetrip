interface BadgeStyle {
  backgroundColor: string;
  textColor: string;
}

// Map status to badge background + text color
export function getStatusBadgeStyle(status: string): BadgeStyle {
  switch (status) {
    case "completed":
      return { backgroundColor: "#bff2bf", textColor: "#0a821c"}; 
    case "not_started":
      return { backgroundColor: "#001F3F", textColor: "#fff" }; 
    case "in_process":
    case "started":
      return { backgroundColor: "#fcb858", textColor: "#b37d02" }; 
    default:
      return { backgroundColor: "#f7665e", textColor: "#940303" }; 
  }
}



// Optional: status label display
export function getStatusLabel(status: string, label?: string) {
  return label ?? status.replace("_", " ").toUpperCase();
}
