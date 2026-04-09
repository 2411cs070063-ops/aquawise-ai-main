import { motion } from "framer-motion";
import { AlertTriangle, Droplets, Zap, Activity } from "lucide-react";
import { anomalies, AnomalyEvent } from "@/data/waterData";
import { cn } from "@/lib/utils";

const typeIcons = {
  leak: Droplets,
  overuse: AlertTriangle,
  spike: Zap,
  pattern: Activity,
};

const severityStyles = {
  high: "border-destructive/40 bg-destructive/5",
  medium: "border-warning/40 bg-warning/5",
  low: "border-info/40 bg-info/5",
};

const severityBadge = {
  high: "bg-destructive/20 text-destructive",
  medium: "bg-warning/20 text-warning",
  low: "bg-info/20 text-info",
};

interface AnomalyAlertsProps {
  zoneName?: string;
}

export function AnomalyAlerts({ zoneName }: AnomalyAlertsProps) {
  const filtered = zoneName ? anomalies.filter((a) => a.zone === zoneName) : anomalies;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Anomaly Detection</h3>
          <p className="text-sm text-muted-foreground">Real-time wastage & leak alerts</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-destructive/20 text-destructive">
          {filtered.length} Active
        </span>
      </div>

      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No anomalies detected in this zone</p>
        )}
        {filtered.map((a, i) => {
          const Icon = typeIcons[a.type];
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className={cn("border rounded-lg p-4 transition-colors hover:bg-muted/30", severityStyles[a.severity])}
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg shrink-0", severityBadge[a.severity])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">{a.zone}</span>
                    <span className={cn("px-1.5 py-0.5 text-[10px] font-bold uppercase rounded", severityBadge[a.severity])}>
                      {a.severity}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{a.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{a.timestamp}</span>
                    <span className="font-mono">
                      {a.value}ML <span className="text-muted-foreground/60">vs {a.expected}ML expected</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
