import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, X, Check, AlertCircle, ChevronDown } from "lucide-react";
import { parseCSV, mapToWaterData, ParsedCSVData } from "@/lib/csvParser";
import { useWaterData } from "@/context/WaterDataContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function DataUpload() {
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [csv, setCsv] = useState<ParsedCSVData | null>(null);
  const [fileName, setFileName] = useState("");
  const [labelCol, setLabelCol] = useState(0);
  const [actualCol, setActualCol] = useState(1);
  const [predictedCol, setPredictedCol] = useState<number | undefined>(undefined);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { setUploadedData } = useWaterData();

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a .csv file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large (max 5MB)");
      return;
    }
    setError("");
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseCSV(e.target?.result as string);
        setCsv(parsed);
        // Auto-detect columns
        const headers = parsed.headers.map((h) => h.toLowerCase());
        const labelIdx = headers.findIndex((h) => /date|time|label|period|month|year|day/i.test(h));
        const actualIdx = headers.findIndex((h) => /actual|usage|consumption|value|amount|demand/i.test(h));
        const predIdx = headers.findIndex((h) => /predict|forecast|estimated/i.test(h));
        if (labelIdx >= 0) setLabelCol(labelIdx);
        if (actualIdx >= 0) setActualCol(actualIdx);
        if (predIdx >= 0) setPredictedCol(predIdx);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse CSV");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleImport = () => {
    if (!csv) return;
    try {
      const mapped = mapToWaterData(csv, labelCol, actualCol, predictedCol);
      if (mapped.length === 0) {
        setError("No valid data rows found");
        return;
      }
      setUploadedData(mapped, fileName);
      toast.success(`Imported ${mapped.length} data points from ${fileName}`);
      setOpen(false);
      setCsv(null);
    } catch (err) {
      setError("Failed to map data. Check column selections.");
    }
  };

  const reset = () => {
    setCsv(null);
    setFileName("");
    setError("");
    setLabelCol(0);
    setActualCol(1);
    setPredictedCol(undefined);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
      >
        <Upload className="h-4 w-4" />
        <span className="hidden sm:inline">Import Data</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Import Water Usage Data</h2>
                    <p className="text-sm text-muted-foreground">Upload a CSV file to update charts</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drop Zone */}
              {!csv && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
                    dragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                  )}
                >
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground mb-1">Drop your CSV file here</p>
                  <p className="text-xs text-muted-foreground">or click to browse • Max 5MB</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    Expected columns: Date/Label, Usage/Actual, Predicted (optional)
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Preview & Mapping */}
              {csv && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{fileName}</span>
                      <span className="text-xs text-muted-foreground">
                        {csv.rows.length} rows • {csv.headers.length} columns
                      </span>
                    </div>
                    <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      Change file
                    </button>
                  </div>

                  {/* Column Mapping */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <ColumnSelect
                      label="Label / Date Column"
                      headers={csv.headers}
                      value={labelCol}
                      onChange={setLabelCol}
                    />
                    <ColumnSelect
                      label="Actual Usage Column"
                      headers={csv.headers}
                      value={actualCol}
                      onChange={setActualCol}
                    />
                    <ColumnSelect
                      label="Predicted (optional)"
                      headers={csv.headers}
                      value={predictedCol ?? -1}
                      onChange={(v) => setPredictedCol(v === -1 ? undefined : v)}
                      allowNone
                    />
                  </div>

                  {/* Preview Table */}
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/50">
                            {csv.headers.map((h, i) => (
                              <th
                                key={i}
                                className={cn(
                                  "px-3 py-2 text-left font-medium text-muted-foreground",
                                  i === labelCol && "text-primary",
                                  i === actualCol && "text-primary",
                                  i === predictedCol && "text-primary"
                                )}
                              >
                                {h}
                                {i === labelCol && <span className="ml-1 text-[10px] text-primary">(label)</span>}
                                {i === actualCol && <span className="ml-1 text-[10px] text-primary">(actual)</span>}
                                {i === predictedCol && <span className="ml-1 text-[10px] text-primary">(pred)</span>}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csv.rows.slice(0, 5).map((row, ri) => (
                            <tr key={ri} className="border-t border-border/50">
                              {row.map((cell, ci) => (
                                <td key={ci} className="px-3 py-2 text-muted-foreground font-mono">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {csv.rows.length > 5 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/30 border-t border-border/50">
                        ... and {csv.rows.length - 5} more rows
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => { setOpen(false); reset(); }}
                      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImport}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      Import {csv.rows.length} rows
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ColumnSelect({
  label,
  headers,
  value,
  onChange,
  allowNone,
}: {
  label: string;
  headers: string[];
  value: number;
  onChange: (v: number) => void;
  allowNone?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full appearance-none bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground pr-8 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {allowNone && <option value={-1}>— None —</option>}
          {headers.map((h, i) => (
            <option key={i} value={i}>{h}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
