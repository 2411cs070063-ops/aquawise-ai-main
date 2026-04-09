import { useEffect, useMemo, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { zones, generateForecast, WaterZone } from "@/data/waterData";
import { Droplets, TrendingUp, Users, Activity, MapPin, X, BarChart3 } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const statusColors: Record<string, string> = {
  normal: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
};

function createCustomIcon(status: string) {
  const color = statusColors[status] || "#3b82f6";
  return L.divIcon({
    className: "custom-zone-marker",
    html: `<div style="
      width: 32px; height: 32px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });
}

function createClickedIcon() {
  return L.divIcon({
    className: "custom-clicked-marker",
    html: `<div style="
      width: 36px; height: 36px; border-radius: 50%;
      background: #6366f1; border: 3px solid white;
      box-shadow: 0 2px 12px rgba(99,102,241,0.5);
      display: flex; align-items: center; justify-content: center;
      animation: pulse 1.5s ease-in-out infinite;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  });
}

/** Inverse-distance weighted interpolation from known zones */
function interpolateWaterLevel(lat: number, lng: number) {
  const distances = zones.map((z) => {
    const d = Math.sqrt((z.lat - lat) ** 2 + (z.lng - lng) ** 2);
    return { zone: z, distance: Math.max(d, 0.001) }; // avoid div-by-zero
  });

  // Sort by distance
  distances.sort((a, b) => a.distance - b.distance);
  const nearest = distances[0];
  const nearestZones = distances.slice(0, 3); // use top-3 for interpolation

  // IDW weights
  const totalWeight = nearestZones.reduce((s, d) => s + 1 / d.distance ** 2, 0);
  const interpolatedAvg = nearestZones.reduce(
    (s, d) => s + (d.zone.avgDaily / d.distance ** 2) / totalWeight,
    0
  );

  // Generate forecast-like data using nearest zone as base, scaled by interpolated avg
  const scaleFactor = interpolatedAvg / nearest.zone.avgDaily;
  const baseForecast = generateForecast("daily", nearest.zone.id);

  const forecast = baseForecast.map((f) => ({
    label: f.label,
    actual: f.actual > 0 ? Math.round(f.actual * scaleFactor * 10) / 10 : 0,
    predicted: Math.round(f.predicted * scaleFactor * 10) / 10,
    lower: Math.round(f.lower * scaleFactor * 10) / 10,
    upper: Math.round(f.upper * scaleFactor * 10) / 10,
  }));

  // Determine status
  const diff = ((interpolatedAvg - nearest.zone.avgDaily) / nearest.zone.avgDaily) * 100;
  const status: "normal" | "warning" | "critical" =
    Math.abs(diff) > 30 ? "critical" : Math.abs(diff) > 15 ? "warning" : "normal";

  return {
    avgDaily: Math.round(interpolatedAvg * 10) / 10,
    nearestZone: nearest.zone,
    distanceKm: Math.round(nearest.distance * 111 * 10) / 10, // rough deg-to-km
    status,
    forecast,
  };
}

interface ClickedLocation {
  lat: number;
  lng: number;
  data: ReturnType<typeof interpolateWaterLevel>;
}

interface ZoneMapProps {
  selectedZone: string;
  onSelectZone: (id: string) => void;
}

function FlyToZone({ zone }: { zone: WaterZone | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (zone) {
      map.flyTo([zone.lat, zone.lng], 13, { duration: 1.2 });
    }
  }, [zone, map]);
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function ZoneMap({ selectedZone, onSelectZone }: ZoneMapProps) {
  const selectedZoneData = useMemo(() => zones.find((z) => z.id === selectedZone), [selectedZone]);
  const [clickedLocation, setClickedLocation] = useState<ClickedLocation | null>(null);

  const forecast = useMemo(() => generateForecast("daily", selectedZone), [selectedZone]);
  const latestActual = forecast.find((f) => f.actual > 0);
  const latestPredicted = forecast[forecast.length - 1];

  const center: [number, number] = [22.0, 79.0];

  const handleMapClick = useCallback((lat: number, lng: number) => {
    // Check if click is near an existing zone (within ~0.01 degrees ≈ 1km)
    const nearZone = zones.find(
      (z) => Math.abs(z.lat - lat) < 0.01 && Math.abs(z.lng - lng) < 0.01
    );
    if (nearZone) {
      onSelectZone(nearZone.id);
      setClickedLocation(null);
      return;
    }

    const data = interpolateWaterLevel(lat, lng);
    setClickedLocation({ lat, lng, data });
  }, [onSelectZone]);

  const clearClickedLocation = () => setClickedLocation(null);

  // Display data: either clicked location or selected zone
  const displayForecast = clickedLocation ? clickedLocation.data.forecast : forecast;
  const futurePoints = displayForecast.filter((f) => f.actual === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Zone Map — Water Levels</h3>
          <p className="text-sm text-muted-foreground">
            Click anywhere on the map to see water levels & predictions for that location
          </p>
        </div>
        {clickedLocation && (
          <button
            onClick={clearClickedLocation}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground bg-muted rounded-md px-2 py-1 transition-colors"
          >
            <X className="h-3 w-3" /> Clear pin
          </button>
        )}
      </div>

      <div className="rounded-lg overflow-hidden border border-border/50" style={{ height: 420 }}>
        <MapContainer
          center={center}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyToZone zone={clickedLocation ? undefined : selectedZoneData} />
          <MapClickHandler onMapClick={handleMapClick} />

          {/* Zone markers */}
          {zones.map((zone) => {
            const zForecast = generateForecast("daily", zone.id);
            const zActual = zForecast.filter((f) => f.actual > 0);
            const currentLevel = zActual.length > 0 ? zActual[zActual.length - 1].actual : zone.avgDaily;
            const predictedLevel = zForecast[zForecast.length - 1].predicted;
            const diff = ((currentLevel - predictedLevel) / predictedLevel) * 100;

            return (
              <Marker
                key={zone.id}
                position={[zone.lat, zone.lng]}
                icon={createCustomIcon(zone.status)}
                eventHandlers={{
                  click: () => {
                    onSelectZone(zone.id);
                    setClickedLocation(null);
                  },
                }}
              >
                <Popup>
                  <div style={{ minWidth: 200, fontFamily: "inherit" }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: statusColors[zone.status] }}>
                      {zone.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                      Status: {zone.status}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div style={{ background: "#f0f9ff", borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 2 }}>Current Level</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#0ea5e9" }}>{currentLevel.toFixed(1)}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>ML/day</div>
                      </div>
                      <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 2 }}>Predicted</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#22c55e" }}>{predictedLevel.toFixed(1)}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>ML/day</div>
                      </div>
                    </div>
                    <div style={{
                      marginTop: 8, padding: "6px 10px", borderRadius: 6,
                      background: diff > 10 ? "#fef2f2" : diff > 0 ? "#fffbeb" : "#f0fdf4",
                      fontSize: 12, fontWeight: 600,
                      color: diff > 10 ? "#dc2626" : diff > 0 ? "#d97706" : "#16a34a",
                    }}>
                      {diff > 0 ? "↑" : "↓"} {Math.abs(diff).toFixed(1)}% {diff > 0 ? "above" : "below"} predicted
                    </div>
                    <div style={{ marginTop: 6, fontSize: 11, color: "#94a3b8" }}>
                      Pop: {(zone.population / 1000).toFixed(0)}k • Avg: {zone.avgDaily} ML/day
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Clicked location marker */}
          {clickedLocation && (
            <Marker
              position={[clickedLocation.lat, clickedLocation.lng]}
              icon={createClickedIcon()}
            >
              <Popup>
                <div style={{ minWidth: 220, fontFamily: "inherit" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, color: "#6366f1" }}>
                    📍 Custom Location
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>
                    {clickedLocation.lat.toFixed(4)}, {clickedLocation.lng.toFixed(4)}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div style={{ background: "#f0f9ff", borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ fontSize: 10, color: "#64748b", marginBottom: 2 }}>Est. Current</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#0ea5e9" }}>
                        {clickedLocation.data.avgDaily}
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>ML/day</div>
                    </div>
                    <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ fontSize: 10, color: "#64748b", marginBottom: 2 }}>Predicted</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#22c55e" }}>
                        {futurePoints.length > 0 ? futurePoints[0].predicted : clickedLocation.data.avgDaily}
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>ML/day</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, color: "#64748b", background: "#f8fafc", borderRadius: 6, padding: "6px 8px" }}>
                    Nearest zone: <strong>{clickedLocation.data.nearestZone.name}</strong> ({clickedLocation.data.distanceKm} km)
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Clicked location prediction panel */}
      <AnimatePresence mode="wait">
        {clickedLocation && (
          <motion.div
            key="clicked-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 border border-border/50 rounded-lg p-4 bg-card/50"
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                Predictions for ({clickedLocation.lat.toFixed(4)}, {clickedLocation.lng.toFixed(4)})
              </h4>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                clickedLocation.data.status === "critical"
                  ? "bg-destructive/10 text-destructive"
                  : clickedLocation.data.status === "warning"
                  ? "bg-warning/10 text-warning"
                  : "bg-success/10 text-success"
              }`}>
                {clickedLocation.data.status}
              </span>
            </div>

            {/* Current + predicted stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <Droplets className="h-4 w-4 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold text-foreground">{clickedLocation.data.avgDaily}</div>
                <div className="text-xs text-muted-foreground">Est. Current ML/day</div>
              </div>
              <div className="bg-success/10 rounded-lg p-3 text-center">
                <TrendingUp className="h-4 w-4 mx-auto mb-1 text-success" />
                <div className="text-lg font-bold text-foreground">
                  {futurePoints.length > 0 ? futurePoints[futurePoints.length - 1].predicted : "—"}
                </div>
                <div className="text-xs text-muted-foreground">Future Predicted</div>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <Activity className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <div className="text-lg font-bold text-foreground">{clickedLocation.data.distanceKm} km</div>
                <div className="text-xs text-muted-foreground">From Nearest Zone</div>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <BarChart3 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <div className="text-lg font-bold text-foreground">{clickedLocation.data.nearestZone.name}</div>
                <div className="text-xs text-muted-foreground">Reference Zone</div>
              </div>
            </div>

            {/* Forecast timeline */}
            <div>
              <h5 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Daily Forecast Timeline
              </h5>
              <div className="grid grid-cols-7 gap-1.5">
                {displayForecast.map((f, i) => {
                  const isFuture = f.actual === 0;
                  const value = isFuture ? f.predicted : f.actual;
                  const maxVal = Math.max(...displayForecast.map((p) => Math.max(p.predicted, p.actual || 0)));
                  const height = Math.max(8, (value / maxVal) * 48);

                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="relative w-full flex items-end justify-center" style={{ height: 52 }}>
                        <div
                          className={`w-full max-w-[24px] rounded-t-sm transition-all ${
                            isFuture
                              ? "bg-primary/30 border border-dashed border-primary/50"
                              : "bg-primary"
                          }`}
                          style={{ height }}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground leading-none">{f.label}</span>
                      <span className={`text-[9px] font-medium leading-none ${isFuture ? "text-primary/70" : "text-foreground"}`}>
                        {value.toFixed(0)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-2 rounded-sm bg-primary" /> Actual
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-2 rounded-sm bg-primary/30 border border-dashed border-primary/50" /> Predicted
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected zone quick stats (when no custom click) */}
      {!clickedLocation && selectedZoneData && (
        <motion.div
          key={selectedZone}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <Droplets className="h-4 w-4 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold text-foreground">{latestActual?.actual.toFixed(1) ?? "—"}</div>
            <div className="text-xs text-muted-foreground">Current ML/day</div>
          </div>
          <div className="bg-success/10 rounded-lg p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-success" />
            <div className="text-lg font-bold text-foreground">{latestPredicted?.predicted.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Predicted ML/day</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold text-foreground">{(selectedZoneData.population / 1000).toFixed(0)}k</div>
            <div className="text-xs text-muted-foreground">Population</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <Activity className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold text-foreground">{selectedZoneData.avgDaily}</div>
            <div className="text-xs text-muted-foreground">Avg Daily ML</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
