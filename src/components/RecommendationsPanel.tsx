import { motion } from "framer-motion";
import { recommendations, Recommendation } from "@/data/waterData";
import { cn } from "@/lib/utils";
import { Lightbulb, ArrowRight, TrendingDown } from "lucide-react";

const impactStyles = {
  high: "bg-success/15 text-success border-success/30",
  medium: "bg-info/15 text-info border-info/30",
  low: "bg-muted text-muted-foreground border-border",
};

const categoryLabels: Record<string, string> = {
  conservation: "Conservation",
  infrastructure: "Infrastructure",
  planning: "Planning",
  pricing: "Pricing",
};

export function RecommendationsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Smart Recommendations</h3>
          <p className="text-sm text-muted-foreground">AI-powered sustainability actions</p>
        </div>
        <div className="p-2 rounded-lg bg-accent/10">
          <Lightbulb className="h-5 w-5 text-accent" />
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.08 }}
            className="border border-border/50 rounded-lg p-4 hover:bg-muted/20 transition-colors group cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-foreground">{r.title}</span>
                  <span className={cn("px-1.5 py-0.5 text-[10px] font-bold uppercase rounded border", impactStyles[r.impact])}>
                    {r.impact}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{r.description}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {categoryLabels[r.category]}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-success font-semibold">
                    <TrendingDown className="h-3 w-3" />
                    {r.savingsPercent}% savings
                  </span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
