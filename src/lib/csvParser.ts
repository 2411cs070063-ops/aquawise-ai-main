export interface ParsedCSVData {
  headers: string[];
  rows: string[][];
}

export interface MappedWaterData {
  label: string;
  actual: number;
  predicted?: number;
}

export function parseCSV(text: string): ParsedCSVData {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row");

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).filter((l) => l.trim()).map(parseLine);

  return { headers, rows };
}

function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function mapToWaterData(
  csv: ParsedCSVData,
  labelCol: number,
  actualCol: number,
  predictedCol?: number
): MappedWaterData[] {
  return csv.rows.map((row) => ({
    label: row[labelCol] ?? "",
    actual: parseFloat(row[actualCol]) || 0,
    predicted: predictedCol !== undefined ? parseFloat(row[predictedCol]) || 0 : undefined,
  }));
}
