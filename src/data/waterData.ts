import { Droplets, TrendingUp, TrendingDown, AlertTriangle, Gauge, Users, CloudRain, Thermometer } from "lucide-react";

export interface WaterZone {
  id: string;
  name: string;
  population: number;
  avgDaily: number;
  status: "normal" | "warning" | "critical";
  lat: number;
  lng: number;
}

export interface ForecastPoint {
  label: string;
  actual: number;
  predicted: number;
  lower: number;
  upper: number;
}

export interface AnomalyEvent {
  id: string;
  zone: string;
  type: "leak" | "overuse" | "spike" | "pattern";
  severity: "low" | "medium" | "high";
  message: string;
  timestamp: string;
  value: number;
  expected: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: "conservation" | "infrastructure" | "planning" | "pricing";
  savingsPercent: number;
}

export const zones: WaterZone[] = [
  // North India
  { id: "z1", name: "New Delhi", population: 1900000, avgDaily: 320.5, status: "critical", lat: 28.6139, lng: 77.2090 },
  { id: "z2", name: "Jaipur", population: 670000, avgDaily: 95.3, status: "warning", lat: 26.9124, lng: 75.7873 },
  { id: "z3", name: "Lucknow", population: 820000, avgDaily: 110.7, status: "normal", lat: 26.8467, lng: 80.9462 },
  { id: "z4", name: "Chandigarh", population: 310000, avgDaily: 52.1, status: "normal", lat: 30.7333, lng: 76.7794 },
  // West India
  { id: "z5", name: "Mumbai", population: 2100000, avgDaily: 385.0, status: "warning", lat: 19.0760, lng: 72.8777 },
  { id: "z6", name: "Ahmedabad", population: 820000, avgDaily: 140.2, status: "critical", lat: 23.0225, lng: 72.5714 },
  // South India
  { id: "z7", name: "Chennai", population: 1070000, avgDaily: 175.8, status: "warning", lat: 13.0827, lng: 80.2707 },
  { id: "z8", name: "Bengaluru", population: 1250000, avgDaily: 195.4, status: "normal", lat: 12.9716, lng: 77.5946 },
  { id: "z9", name: "Hyderabad", population: 990000, avgDaily: 162.3, status: "normal", lat: 17.3850, lng: 78.4867 },
  { id: "z10", name: "Kochi", population: 410000, avgDaily: 68.9, status: "normal", lat: 9.9312, lng: 76.2673 },
  // East India
  { id: "z11", name: "Kolkata", population: 1480000, avgDaily: 245.6, status: "warning", lat: 22.5726, lng: 88.3639 },
  { id: "z12", name: "Bhubaneswar", population: 380000, avgDaily: 58.4, status: "normal", lat: 20.2961, lng: 85.8245 },
  // Central India
  { id: "z13", name: "Bhopal", population: 460000, avgDaily: 78.2, status: "normal", lat: 23.2599, lng: 77.4126 },
  { id: "z14", name: "Nagpur", population: 530000, avgDaily: 88.5, status: "warning", lat: 21.1458, lng: 79.0882 },
  // Northeast
  { id: "z15", name: "Guwahati", population: 340000, avgDaily: 62.7, status: "normal", lat: 26.1445, lng: 91.7362 },
  // Northwest
  { id: "z16", name: "Amritsar", population: 290000, avgDaily: 48.3, status: "normal", lat: 31.6340, lng: 74.8723 },
  // Far South
  { id: "z17", name: "Thiruvananthapuram", population: 360000, avgDaily: 55.1, status: "normal", lat: 8.5241, lng: 76.9366 },
  // Coastal
  { id: "z18", name: "Visakhapatnam", population: 430000, avgDaily: 72.6, status: "warning", lat: 17.6868, lng: 83.2185 },
  { id: "z19", name: "Pune", population: 730000, avgDaily: 125.8, status: "normal", lat: 18.5204, lng: 73.8567 },
  { id: "z20", name: "Patna", population: 580000, avgDaily: 98.4, status: "critical", lat: 25.6093, lng: 85.1376 },
];

export const generateForecast = (period: "daily" | "monthly" | "yearly", zoneId?: string): ForecastPoint[] => {
  const labels = {
    daily: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon+1", "Tue+1", "Wed+1", "Thu+1", "Fri+1", "Sat+1", "Sun+1"],
    monthly: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    yearly: ["2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028"],
  };

  // Scale base & variance by zone's avgDaily usage
  const zone = zoneId ? zones.find((z) => z.id === zoneId) : undefined;
  const scaleFactor = zone ? zone.avgDaily / 48.2 : 1; // normalize against Downtown Core baseline

  const base = { daily: 42 * scaleFactor, monthly: 1280 * scaleFactor, yearly: 15400 * scaleFactor };
  const variance = { daily: 8 * scaleFactor, monthly: 200 * scaleFactor, yearly: 1500 * scaleFactor };
  const b = base[period];
  const v = variance[period];

  // Use a seeded-style deterministic offset per zone so values don't change on re-render
  const seed = zoneId ? zoneId.charCodeAt(1) * 13.7 : 0;

  return labels[period].map((label, i) => {
    const seasonal = Math.sin((i / labels[period].length) * Math.PI * 2 + seed * 0.1) * v * 0.4;
    const trend = i * (v * 0.05);
    const noise = Math.sin(seed + i * 3.14) * v * 0.15;
    const actual = i < labels[period].length * 0.6 ? b + seasonal + trend + noise : 0;
    const predicted = b + seasonal + trend;
    return {
      label,
      actual: Math.round(actual * 10) / 10,
      predicted: Math.round(predicted * 10) / 10,
      lower: Math.round((predicted - v * 0.25) * 10) / 10,
      upper: Math.round((predicted + v * 0.25) * 10) / 10,
    };
  });
};

export const anomalies: AnomalyEvent[] = [
  { id: "a1", zone: "Industrial Park", type: "leak", severity: "high", message: "Potential pipeline leak detected — 42% above baseline for 6 hours", timestamp: "2 hours ago", value: 263, expected: 185 },
  { id: "a2", zone: "North Residential", type: "overuse", severity: "medium", message: "Residential consumption 18% above seasonal average", timestamp: "4 hours ago", value: 61.5, expected: 52.1 },
  { id: "a3", zone: "East Waterfront", type: "spike", severity: "medium", message: "Sudden usage spike correlating with temperature rise", timestamp: "6 hours ago", value: 58.2, expected: 44.9 },
  { id: "a4", zone: "Downtown Core", type: "pattern", severity: "low", message: "Unusual night-time consumption pattern detected", timestamp: "12 hours ago", value: 12.3, expected: 4.8 },
];

export const recommendations: Recommendation[] = [
  { id: "r1", title: "Deploy Smart Meters in Industrial Park", description: "Real-time monitoring could identify the suspected leak within minutes, saving an estimated 78,000L daily.", impact: "high", category: "infrastructure", savingsPercent: 15 },
  { id: "r2", title: "Implement Tiered Pricing for Peak Hours", description: "Dynamic pricing during 6-9 AM and 5-8 PM could reduce peak demand by up to 22%.", impact: "high", category: "pricing", savingsPercent: 22 },
  { id: "r3", title: "Rainwater Harvesting Program", description: "Installing collection systems in South Suburbs could offset 12% of residential demand during monsoon season.", impact: "medium", category: "conservation", savingsPercent: 12 },
  { id: "r4", title: "Predictive Maintenance Schedule", description: "ML-based pipe age analysis suggests 3 critical segments need replacement within 6 months.", impact: "medium", category: "infrastructure", savingsPercent: 8 },
  { id: "r5", title: "Campus Water Recycling", description: "University greywater recycling could reduce freshwater demand by 30% for irrigation and sanitation.", impact: "medium", category: "conservation", savingsPercent: 30 },
];

export const heatmapData = [
  { hour: "12AM", Mon: 12, Tue: 14, Wed: 11, Thu: 13, Fri: 15, Sat: 18, Sun: 20 },
  { hour: "4AM", Mon: 8, Tue: 9, Wed: 7, Thu: 8, Fri: 10, Sat: 14, Sun: 16 },
  { hour: "8AM", Mon: 45, Tue: 48, Wed: 44, Thu: 46, Fri: 42, Sat: 35, Sun: 30 },
  { hour: "12PM", Mon: 52, Tue: 55, Wed: 50, Thu: 53, Fri: 48, Sat: 40, Sun: 38 },
  { hour: "4PM", Mon: 58, Tue: 60, Wed: 55, Thu: 57, Fri: 62, Sat: 45, Sun: 42 },
  { hour: "8PM", Mon: 38, Tue: 40, Wed: 36, Thu: 39, Fri: 44, Sat: 48, Sun: 50 },
];

export const metrics = {
  totalConsumption: 2847,
  avgPerCapita: 142,
  efficiency: 87.3,
  forecastAccuracy: 94.2,
  anomaliesDetected: 4,
  savingsPotential: 18.5,
  temperature: 32,
  rainfall: 2.4,
};
