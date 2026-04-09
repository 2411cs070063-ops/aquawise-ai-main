import { motion } from "framer-motion";
import { zones, WaterZone } from "@/data/waterData";
import { cn } from "@/lib/utils";
import { MapPin, Users, Droplets } from "lucide-react";

interface AreaSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

const statusStyles = {
  normal: "border-success/30 hover:border-success/50",
  warning: "border-warning/30 hover:border-warning/50",
  critical: "border-destructive/30 hover:border-destructive/50 animate-pulse-glow",
};

const statusDot = {
  normal: "bg-success",
  warning: "bg-warning",
  critical: "bg-destructive",
};

export function AreaSelector({ selected, onSelect }: AreaSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6"
    >
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-foreground">Zone Analysis</h3>
        <p className="text-sm text-muted-foreground">Select an area to analyze</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => onSelect(zone.id)}
            className={cn(
              "border rounded-lg p-4 text-left transition-all duration-200",
              statusStyles[zone.status],
              selected === zone.id
                ? "bg-primary/10 border-primary/50 ring-1 ring-primary/30"
                : "bg-card/50 hover:bg-muted/30"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("w-2 h-2 rounded-full", statusDot[zone.status])} />
              <span className="text-sm font-semibold text-foreground truncate">{zone.name}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {(zone.population / 1000).toFixed(0)}k
              </span>
              <span className="flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                {zone.avgDaily} ML/day
              </span>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
