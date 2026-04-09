import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { MappedWaterData } from "@/lib/csvParser";
import { generatePredictions, computeMetrics } from "@/lib/prediction";

interface ComputedMetrics {
  totalConsumption: number;
  avgUsage: number;
  accuracy: number;
  anomalyCount: number;
  savingsPotential: number;
}

interface UploadedDataState {
  data: MappedWaterData[] | null;
  fileName: string | null;
  rowCount: number;
  computedMetrics: ComputedMetrics | null;
  setUploadedData: (data: MappedWaterData[], fileName: string) => void;
  clearUploadedData: () => void;
}

const WaterDataContext = createContext<UploadedDataState>({
  data: null,
  fileName: null,
  rowCount: 0,
  computedMetrics: null,
  setUploadedData: () => {},
  clearUploadedData: () => {},
});

export function WaterDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MappedWaterData[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const computedMetrics = useMemo(() => {
    if (!data) return null;
    const actuals = data.map((d) => d.actual);

    // If data has predictions, use them; otherwise generate
    const hasPredictions = data.some((d) => d.predicted !== undefined && d.predicted !== 0);
    let predictions: number[];
    if (hasPredictions) {
      predictions = data.map((d) => d.predicted ?? d.actual);
    } else {
      const preds = generatePredictions(actuals);
      predictions = preds.map((p) => p.predicted);
    }

    return computeMetrics(actuals, predictions);
  }, [data]);

  const setUploadedData = (d: MappedWaterData[], name: string) => {
    setData(d);
    setFileName(name);
  };

  const clearUploadedData = () => {
    setData(null);
    setFileName(null);
  };

  return (
    <WaterDataContext.Provider
      value={{ data, fileName, rowCount: data?.length ?? 0, computedMetrics, setUploadedData, clearUploadedData }}
    >
      {children}
    </WaterDataContext.Provider>
  );
}

export const useWaterData = () => useContext(WaterDataContext);
