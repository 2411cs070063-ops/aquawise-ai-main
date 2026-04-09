/**
 * Simple linear regression + seasonal prediction for water usage data.
 */
export interface PredictionResult {
  predicted: number;
  lower: number;
  upper: number;
}

/**
 * Given actual values, generate predictions using linear trend + seasonal pattern.
 * For points with actual data, predicted = trend-based estimate.
 * Confidence bands are ±15% of predicted.
 */
export function generatePredictions(actuals: number[]): PredictionResult[] {
  const n = actuals.length;
  if (n === 0) return [];

  // Linear regression: y = a + b*x
  const xMean = (n - 1) / 2;
  const yMean = actuals.reduce((s, v) => s + v, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (actuals[i] - yMean);
    den += (i - xMean) ** 2;
  }
  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;

  // Compute residuals to find seasonal pattern (simple repeating pattern)
  const residuals = actuals.map((v, i) => v - (intercept + slope * i));

  // Moving average smoothing for the residual pattern
  const windowSize = Math.max(1, Math.floor(n / 4));
  const smoothed = residuals.map((_, i) => {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(n, i + Math.ceil(windowSize / 2));
    const slice = residuals.slice(start, end);
    return slice.reduce((s, v) => s + v, 0) / slice.length;
  });

  // Compute standard deviation for confidence bands
  const predErrors = actuals.map((v, i) => v - (intercept + slope * i + smoothed[i]));
  const stdDev = Math.sqrt(predErrors.reduce((s, e) => s + e * e, 0) / n) || yMean * 0.1;

  return actuals.map((_, i) => {
    const trend = intercept + slope * i;
    const seasonal = smoothed[i];
    const predicted = Math.max(0, Math.round((trend + seasonal) * 10) / 10);
    return {
      predicted,
      lower: Math.max(0, Math.round((predicted - 1.5 * stdDev) * 10) / 10),
      upper: Math.round((predicted + 1.5 * stdDev) * 10) / 10,
    };
  });
}

/**
 * Compute summary metrics from uploaded data.
 */
export function computeMetrics(actuals: number[], predictions: number[]) {
  const n = actuals.length;
  const totalConsumption = Math.round(actuals.reduce((s, v) => s + v, 0));
  const avgUsage = Math.round((totalConsumption / n) * 10) / 10;

  // Forecast accuracy: 100 - MAPE
  let mape = 0;
  let validCount = 0;
  for (let i = 0; i < n; i++) {
    if (actuals[i] !== 0) {
      mape += Math.abs((actuals[i] - predictions[i]) / actuals[i]);
      validCount++;
    }
  }
  const accuracy = validCount > 0 ? Math.round((1 - mape / validCount) * 1000) / 10 : 0;

  // Anomalies: points where |actual - predicted| > 2 * stdDev
  const errors = actuals.map((a, i) => Math.abs(a - predictions[i]));
  const meanError = errors.reduce((s, v) => s + v, 0) / n;
  const stdError = Math.sqrt(errors.reduce((s, e) => s + (e - meanError) ** 2, 0) / n);
  const anomalyCount = errors.filter((e) => e > meanError + 2 * stdError).length;

  // Savings potential: percentage of overuse vs predicted
  const overuse = actuals.reduce((s, a, i) => s + Math.max(0, a - predictions[i]), 0);
  const savingsPotential = totalConsumption > 0 ? Math.round((overuse / totalConsumption) * 1000) / 10 : 0;

  return { totalConsumption, avgUsage, accuracy, anomalyCount, savingsPotential };
}
