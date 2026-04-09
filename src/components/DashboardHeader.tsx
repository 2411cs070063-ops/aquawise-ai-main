import { motion } from "framer-motion";
import { Droplets, Bell, LogOut } from "lucide-react";
import { DataUpload } from "@/components/DataUpload";
import { useWaterData } from "@/context/WaterDataContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function DashboardHeader() {
  const { fileName, rowCount, clearUploadedData } = useWaterData();
  const { user, signOut } = useAuth();

  const handleNotifications = () => {
    toast.info("No new notifications", {
      description: "All anomaly alerts are shown in the dashboard below.",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex items-center justify-between py-6"
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/15 glow-border">
          <Droplets className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Aqua<span className="text-gradient-water">Mind</span>
          </h1>
          <p className="text-xs text-muted-foreground">Smart Water Intelligence Platform</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {fileName && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-xs font-medium text-primary">{fileName} ({rowCount} pts)</span>
            <button
              onClick={() => {
                clearUploadedData();
                toast.success("Custom data cleared, using default data");
              }}
              className="text-primary/60 hover:text-primary"
            >
              <span className="text-xs">✕</span>
            </button>
          </div>
        )}
        <DataUpload />
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-success">Live</span>
        </div>
        <button
          onClick={handleNotifications}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>
        {user && (
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
            <span className="text-xs text-muted-foreground max-w-[120px] truncate">{user.email}</span>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </motion.header>
  );
}
