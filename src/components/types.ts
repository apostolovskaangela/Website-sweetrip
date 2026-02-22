export interface Trip {
    id: number;
    destination_from: string;
    destination_to: string;
    driver?: { name: string };
    status: string;
    status_label?: string;
}


export interface Vehicle {
    id: number;
    registration_number: string;
    is_active: boolean;
}

export interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
}

export interface TruckIconProps {
    size?: number;
    color?: string;
}
  