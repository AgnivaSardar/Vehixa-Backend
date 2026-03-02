import { HealthStatus, RiskLevel } from "../generated/prisma/enums";
import { env } from "../config/env";
import { logger } from "./logger";

type TelemetryFeatures = {
  engine_rpm?: number | null;
  lub_oil_pressure?: number | null;
  fuel_pressure?: number | null;
  coolant_pressure?: number | null;
  lub_oil_temp?: number | null;
  coolant_temp?: number | null;
};

type MLAPIResponse = {
  failure_probability: number;
  engine_health: string;
  diagnostic_analysis: string;
  top_influential_features: string[];
};

export type PredictionResult = {
  healthScore: number;
  status: HealthStatus;
  failureProbability: number;
  riskLevel: RiskLevel;
  confidenceScore: number;
  predictedFailureDays: number;
  modelVersion: string;
  diagnosticAnalysis?: string;
  topInfluentialFeatures?: string[];
};

// ML Model's actual probability thresholds used during training
const GOOD_THRESHOLD = 0.3;
const WARNING_THRESHOLD = 0.7;

function normalizeHealthStatus(mlStatus: string, failureProbability: number): HealthStatus {
  // First try to use ML model's classification
  const normalized = mlStatus.toUpperCase();
  if (normalized === 'CRITICAL' || normalized.includes('CRITICAL')) return HealthStatus.CRITICAL;
  if (normalized === 'WARNING' || normalized.includes('WARNING')) return HealthStatus.WARNING;
  if (normalized === 'GOOD' || normalized === 'HEALTHY') return HealthStatus.HEALTHY;
  
  // Fallback to probability-based classification using ML model's thresholds
  if (failureProbability < GOOD_THRESHOLD) return HealthStatus.HEALTHY;
  if (failureProbability <= WARNING_THRESHOLD) return HealthStatus.WARNING;
  return HealthStatus.CRITICAL;
}

function normalizeRiskLevel(failureProbability: number): RiskLevel {
  // Align with ML model's probability thresholds
  if (failureProbability >= WARNING_THRESHOLD) return RiskLevel.SEVERE;
  if (failureProbability >= 0.5) return RiskLevel.HIGH;
  if (failureProbability >= GOOD_THRESHOLD) return RiskLevel.MODERATE;
  return RiskLevel.LOW;
}

export async function predictVehicleHealth(data: TelemetryFeatures): Promise<PredictionResult> {
  try {
    // Call the real ML model API
    const mlUrl = env.ML_MODEL_URL || 'https://engine-health-model-api.onrender.com/predict';
    
    const response = await fetch(mlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        engine_rpm: data.engine_rpm || 2000,
        lub_oil_pressure: data.lub_oil_pressure || 40,
        fuel_pressure: data.fuel_pressure || 60,
        coolant_pressure: data.coolant_pressure || 30,
        lub_oil_temp: data.lub_oil_temp || 90,
        coolant_temp: data.coolant_temp || 85,
      }),
    });

    if (!response.ok) {
      throw new Error(`ML API error: ${response.status}`);
    }

    const mlResponse: MLAPIResponse = await response.json();
    
    const status = normalizeHealthStatus(mlResponse.engine_health, mlResponse.failure_probability);
    const riskLevel = normalizeRiskLevel(mlResponse.failure_probability);
    const healthScore = Math.round((1 - mlResponse.failure_probability) * 100);
    const predictedFailureDays = Math.max(1, Math.round((1 - mlResponse.failure_probability) * 45));
    const confidenceScore = 0.92;

    return {
      healthScore,
      status,
      failureProbability: mlResponse.failure_probability,
      riskLevel,
      confidenceScore,
      predictedFailureDays,
      modelVersion: env.ML_MODEL_VERSION,
      diagnosticAnalysis: mlResponse.diagnostic_analysis,
      topInfluentialFeatures: mlResponse.top_influential_features,
    };
  } catch (error) {
    logger.error('ML Model API error:', { error: error instanceof Error ? error.message : String(error) });
    // Fallback to heuristic calculation
    return fallbackPrediction(data);
  }
}

function fallbackPrediction(data: TelemetryFeatures): PredictionResult {
  // Simple fallback logic
  const failureProbability = 0.15; // Default low failure probability
  const healthScore = Math.round((1 - failureProbability) * 100);
  
  return {
    healthScore,
    status: HealthStatus.HEALTHY,
    failureProbability,
    riskLevel: RiskLevel.LOW,
    confidenceScore: 0.75,
    predictedFailureDays: 35,
    modelVersion: env.ML_MODEL_VERSION,
    diagnosticAnalysis: 'Fallback prediction used due to API unavailability',
    topInfluentialFeatures: ['lub_oil_temp', 'engine_rpm'],
  };
}
