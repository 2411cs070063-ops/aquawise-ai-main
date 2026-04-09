import { useState } from "react";
import { useMemo } from "react";
import { Droplets, Gauge, TrendingUp, AlertTriangle, Thermometer, CloudRain, Users, Target } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricCard } from "@/components/MetricCard";
import { ForecastChart } from "@/components/ForecastChart";
import { AnomalyAlerts } from "@/components/AnomalyAlerts";
import { AreaSelector } from "@/components/AreaSelector";
import { ZoneMap } from "@/components/ZoneMap";
import { ScenarioSimulator } from "@/components/ScenarioSimulator";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { UsageHeatmap } from "@/components/UsageHeatmap";
import { WaterDataProvider, useWaterData } from "@/context/WaterDataContext";
import { metrics, zones } from "@/data/waterData";

function DashboardContent() {
  const [selectedZone, setSelectedZone] = useState("z1");
  const { computedMetrics } = useWaterData();
  const selectedZoneData = useMemo(() => zones.find((z) => z.id === selectedZone), [selectedZone]);

  // Use computed metrics from uploaded data if available, otherwise defaults
  const totalConsumption = computedMetrics?.totalConsumption ?? metrics.totalConsumption;
  const forecastAccuracy = computedMetrics?.accuracy ?? metrics.forecastAccuracy;
  const anomaliesDetected = computedMetrics?.anomalyCount ?? metrics.anomaliesDetected;
  const savingsPotential = computedMetrics?.savingsPotential ?? metrics.savingsPotential;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <DashboardHeader />

        {/* KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Consumption"
            value={totalConsumption.toLocaleString()}
            unit={computedMetrics ? "total" : "ML/day"}
            icon={Droplets}
            variant="primary"
            trend={!computedMetrics ? { value: -3.2, label: "vs last week" } : undefined}
            delay={0.05}
          />
          <MetricCard
            title={computedMetrics ? "Avg Usage" : "Per Capita Usage"}
            value={computedMetrics?.avgUsage ?? metrics.avgPerCapita}
            unit={computedMetrics ? "per point" : "L/person"}
            icon={Users}
            trend={!computedMetrics ? { value: -1.8, label: "improving" } : undefined}
            delay={0.1}
          />
          <MetricCard
            title="Forecast Accuracy"
            value={forecastAccuracy}
            unit="%"
            icon={Target}
            variant="success"
            trend={!computedMetrics ? { value: 2.1, label: "vs last month" } : undefined}
            delay={0.15}
          />
          <MetricCard
            title="Anomalies Detected"
            value={anomaliesDetected}
            unit="active"
            icon={AlertTriangle}
            variant={anomaliesDetected > 0 ? "warning" : "success"}
            delay={0.2}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="System Efficiency"
            value={metrics.efficiency}
            unit="%"
            icon={Gauge}
            delay={0.22}
          />
          <MetricCard
            title="Savings Potential"
            value={savingsPotential}
            unit="%"
            icon={TrendingUp}
            variant="success"
            delay={0.24}
          />
          <MetricCard
            title="Temperature"
            value={metrics.temperature}
            unit="°C"
            icon={Thermometer}
            variant="warning"
            delay={0.26}
          />
          <MetricCard
            title="Rainfall (24h)"
            value={metrics.rainfall}
            unit="mm"
            icon={CloudRain}
            delay={0.28}
          />
        </div>

        {/* Zone Selector */}
        <div className="mb-6">
          <AreaSelector selected={selectedZone} onSelect={setSelectedZone} />
        </div>

        {/* Interactive Map */}
        <div className="mb-6">
          <ZoneMap selectedZone={selectedZone} onSelectZone={setSelectedZone} />
        </div>

        {/* Forecast + Anomalies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ForecastChart zoneId={selectedZone} zoneName={selectedZoneData?.name} />
          </div>
          <div>
            <AnomalyAlerts zoneName={selectedZoneData?.name} />
          </div>
        </div>

        {/* Heatmap + Scenario */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <UsageHeatmap />
          <ScenarioSimulator />
        </div>

        {/* Recommendations */}
        <div className="mb-8">
          <RecommendationsPanel />
        </div>

        {/* Footer */}
        <footer className="border-t border-border/50 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            AquaMind — AI-Powered Water Intelligence Platform • Data refreshed every 15 minutes
          </p>
        </footer>
      </div>
    </div>
  );
}

const Index = () => {
  return (
    <WaterDataProvider>
      <DashboardContent />
    </WaterDataProvider>
  );
};

export default Index;
