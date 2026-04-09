import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Beaker, CloudRain, TrendingUp, Users } from "lucide-react";

interface Scenario {
  id: string;
  label: string;
  icon: typeof Beaker;
  description: string;
  multipliers: { demand: number; supply: number };
}

const scenarios: Scenario[] = [
  { id: "drought", label: "Drought", icon: Beaker, description: "30% reduction in supply, 15% demand increase", multipliers: { demand: 1.15, supply: 0.7 } },
  { id: "growth", label: "Population Growth", icon: Users, description: "20% population increase over 5 years", multipliers: { demand: 1.2, supply: 1.0 } },
  { id: "monsoon", label: "Heavy Rainfall", icon: CloudRain, description: "Monsoon season with 40% more precipitation", multipliers: { demand: 0.85, supply: 1.4 } },
  { id: "efficiency", label: "Smart Meters", icon: TrendingUp, description: "15% demand reduction through smart monitoring", multipliers: { demand: 0.85, supply: 1.0 } },
];

const baseData = [
  { zone: "Downtown", demand: 48, supply: 55 },
  { zone: "North Res.", demand: 52, supply: 50 },
  { zone: "Industrial", demand: 185, supply: 170 },
  { zone: "University", demand: 39, supply: 45 },
  { zone: "South Sub.", demand: 61, supply: 65 },
  { zone: "East Water.", demand: 45, supply: 48 },
];

export function ScenarioSimulator() {
  const [active, setActive] = useState<string>("drought");
  const scenario = scenarios.find((s) => s.id === active)!;

  const simData = baseData.map((d) => ({
    ...d,
    simDemand: Math.round(d.demand * scenario.multipliers.demand * 10) / 10,
    simSupply: Math.round(d.supply * scenario.multipliers.supply * 10) / 10,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card p-6"
    >
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-foreground">What-If Scenario Simulator</h3>
        <p className="text-sm text-muted-foreground">Simulate supply & demand under different conditions</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {scenarios.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                active === s.id
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {s.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mb-4 px-1">{scenario.description}</p>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={simData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 16%)" />
            <XAxis dataKey="zone" stroke="hsl(215, 15%, 50%)" fontSize={11} tickLine={false} />
            <YAxis stroke="hsl(215, 15%, 50%)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(215, 25%, 9%)",
                border: "1px solid hsl(215, 20%, 16%)",
                borderRadius: "0.5rem",
                color: "hsl(200, 20%, 92%)",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="simDemand" name="Sim. Demand" fill="hsl(185, 72%, 48%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="simSupply" name="Sim. Supply" fill="hsl(165, 60%, 45%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
