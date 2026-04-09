import { motion } from "framer-motion";
import { heatmapData } from "@/data/waterData";
import { cn } from "@/lib/utils";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getHeatColor(value: number): string {
  if (value < 15) return "bg-info/10 text-info/60";
  if (value < 30) return "bg-info/25 text-info";
  if (value < 45) return "bg-primary/30 text-primary";
  if (value < 55) return "bg-primary/50 text-primary";
  return "bg-warning/40 text-warning";
}

export function UsageHeatmap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="glass-card p-6"
    >
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-foreground">Usage Heatmap</h3>
        <p className="text-sm text-muted-foreground">Consumption patterns by hour and day</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-xs text-muted-foreground font-medium py-2 px-1 text-left w-16">Time</th>
              {days.map((d) => (
                <th key={d} className="text-xs text-muted-foreground font-medium py-2 px-1 text-center">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.map((row) => (
              <tr key={row.hour}>
                <td className="text-xs text-muted-foreground font-mono py-1 px-1">{row.hour}</td>
                {days.map((day) => {
                  const val = row[day as keyof typeof row] as number;
                  return (
                    <td key={day} className="py-1 px-1">
                      <div
                        className={cn(
                          "rounded-md text-center text-xs font-mono font-medium py-2 transition-all hover:scale-105",
                          getHeatColor(val)
                        )}
                      >
                        {val}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-3 mt-4">
        <span className="text-[10px] text-muted-foreground">Low</span>
        <div className="flex gap-1">
          {["bg-info/10", "bg-info/25", "bg-primary/30", "bg-primary/50", "bg-warning/40"].map((c, i) => (
            <div key={i} className={cn("w-6 h-3 rounded-sm", c)} />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">High (ML/hr)</span>
      </div>
    </motion.div>
  );
}
