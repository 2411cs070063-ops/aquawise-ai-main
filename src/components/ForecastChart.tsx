import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { generateForecast } from "@/data/waterData";
import { generatePredictions } from "@/lib/prediction";
import { useWaterData } from "@/context/WaterDataContext";
import { Database } from "lucide-react";

type Period = "daily" | "monthly" | "yearly";

const periodLabels: Record<Period, string> = {
  daily: "Daily",
  monthly: "Monthly",
  yearly: "Yearly",
};

interface ForecastChartProps {
  zoneId?: string;
  zoneName?: string;
}

export function ForecastChart({ zoneId, zoneName }: ForecastChartProps) {
  const [period, setPeriod] = useState<Period>("monthly");
  const { data: uploadedData, fileName } = useWaterData();

  const chartData = useMemo(() => {
    if (uploadedData) {
      const actuals = uploadedData.map((d) => d.actual);
      const hasPredictions = uploadedData.some((d) => d.predicted !== undefined && d.predicted !== 0);
      const predictions = hasPredictions
        ? uploadedData.map((d) => ({
            predicted: d.predicted ?? d.actual,
            lower: (d.predicted ?? d.actual) * 0.85,
            upper: (d.predicted ?? d.actual) * 1.15,
          }))
        : generatePredictions(actuals);

      return uploadedData.map((d, i) => ({
        label: d.label,
        actual: d.actual,
        predicted: predictions[i].predicted,
        lower: predictions[i].lower,
        upper: predictions[i].upper,
      }));
    }
    return generateForecast(period, zoneId);
  }, [uploadedData, period, zoneId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Water Usage Forecast
            {uploadedData && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                <Database className="h-3 w-3" />
                Custom Data
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            {uploadedData
              ? `Showing ${fileName} — ML predictions generated`
              : zoneName
                ? `Zone: ${zoneName} — ML-driven prediction`
                : "ML-driven prediction with confidence bands"}
          </p>
        </div>
        {!uploadedData && (
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(Object.keys(periodLabels) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  period === p
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(185, 72%, 48%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(185, 72%, 48%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(165, 60%, 45%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(165, 60%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 16%)" />
            <XAxis dataKey="label" stroke="hsl(215, 15%, 50%)" fontSize={12} tickLine={false} />
            <YAxis stroke="hsl(215, 15%, 50%)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(215, 25%, 9%)",
                border: "1px solid hsl(215, 20%, 16%)",
                borderRadius: "0.5rem",
                color: "hsl(200, 20%, 92%)",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="upper" stackId="confidence" stroke="none" fill="url(#gradConfidence)" name="Upper Bound" />
            <Area type="monotone" dataKey="lower" stackId="confidence2" stroke="none" fill="transparent" name="Lower Bound" />
            <Area type="monotone" dataKey="actual" stroke="hsl(185, 72%, 48%)" strokeWidth={2} fill="url(#gradActual)" name="Actual" dot={{ r: 3, fill: "hsl(185, 72%, 48%)" }} />
            <Area type="monotone" dataKey="predicted" stroke="hsl(165, 60%, 45%)" strokeWidth={2} strokeDasharray="6 3" fill="url(#gradPredicted)" name="Predicted" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
