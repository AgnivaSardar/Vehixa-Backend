import { HealthStatus, RiskLevel } from "../generated/prisma/enums";
import { env } from "../config/env";

type TelemetryFeatures = {
  engineTemp?: number | null;
  batteryVoltage?: number | null;
  rpm?: number | null;
  oilPressure?: number | null;
  mileage?: number | null;
  vibrationLevel?: number | null;
  errorCodesCount?: number | null;
  coolantLevel?: number | null;
};

export type PredictionResult = {
  healthScore: number;
  status: HealthStatus;
  failureProbability: number;
  riskLevel: RiskLevel;
  confidenceScore: number;
  predictedFailureDays: number;
  modelVersion: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalize(value: number, ideal: number, tolerance: number): number {
  const distance = Math.abs(value - ideal);
  return clamp(distance / tolerance, 0, 1);
}

export function predictVehicleHealth(data: TelemetryFeatures): PredictionResult {
  const penalties: number[] = [];

  if (data.engineTemp != null) penalties.push(normalize(data.engineTemp, 92, 25) * 20);
  if (data.batteryVoltage != null) penalties.push(normalize(data.batteryVoltage, 12.6, 2.2) * 15);
  if (data.rpm != null) penalties.push(normalize(data.rpm, 2200, 3000) * 10);
  if (data.oilPressure != null) penalties.push(normalize(data.oilPressure, 40, 30) * 15);
  if (data.mileage != null) penalties.push(clamp(data.mileage / 350000, 0, 1) * 12);
  if (data.vibrationLevel != null) penalties.push(clamp(data.vibrationLevel / 12, 0, 1) * 18);
  if (data.errorCodesCount != null) penalties.push(clamp(data.errorCodesCount / 12, 0, 1) * 20);
  if (data.coolantLevel != null) penalties.push(normalize(data.coolantLevel, 80, 50) * 10);

  const totalPenalty = penalties.reduce((sum, current) => sum + current, 0);
  const healthScore = Number(clamp(100 - totalPenalty, 0, 100).toFixed(2));
  const failureProbability = Number((1 - healthScore / 100).toFixed(3));

  let status: HealthStatus = HealthStatus.HEALTHY;
  if (healthScore < 40) status = HealthStatus.CRITICAL;
  else if (healthScore < 70) status = HealthStatus.WARNING;

  let riskLevel: RiskLevel = RiskLevel.LOW;
  if (failureProbability >= 0.75) riskLevel = RiskLevel.SEVERE;
  else if (failureProbability >= 0.5) riskLevel = RiskLevel.HIGH;
  else if (failureProbability >= 0.25) riskLevel = RiskLevel.MODERATE;

  const featuresPresent = Object.values(data).filter((value) => value != null).length;
  const confidenceScore = Number(clamp(0.5 + featuresPresent * 0.06, 0.55, 0.98).toFixed(3));

  const predictedFailureDays = Math.max(1, Math.round((1 - failureProbability) * 45));

  return {
    healthScore,
    status,
    failureProbability,
    riskLevel,
    confidenceScore,
    predictedFailureDays,
    modelVersion: env.ML_MODEL_VERSION,
  };
}
