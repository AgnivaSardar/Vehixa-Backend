import { prisma } from "../config/db";
import {
  ActionType,
  AlertSeverity,
  HealthStatus,
  RecommendationPriority,
  RiskLevel,
} from "../generated/prisma/enums";
import { logger } from "../utils/logger";
import { predictVehicleHealth } from "../utils/mlClient";

type TelemetryForPrediction = {
  telemetryId: string;
  vehicleId: string;
  engineRpm: number | null;
  lubOilPressure: number | null;
  fuelPressure: number | null;
  coolantPressure: number | null;
  lubOilTemp: number | null;
  coolantTemp: number | null;
};

type RecommendationDraft = {
  title: string;
  description: string;
  priority: RecommendationPriority;
  actionType: ActionType;
  actionDueDays: number;
};

function buildRecommendations(status: HealthStatus, riskLevel: RiskLevel): RecommendationDraft[] {
  const recommendations: RecommendationDraft[] = [];

  if (status === HealthStatus.HEALTHY) {
    recommendations.push({
      title: "Continue Monitoring",
      description: "Vehicle health is stable. Continue routine telemetry monitoring.",
      priority: RecommendationPriority.LOW,
      actionType: ActionType.MONITOR,
      actionDueDays: 14,
    });
    return recommendations;
  }

  recommendations.push({
    title: "Inspect Core Systems",
    description: "Run diagnostics for engine, battery and lubrication systems.",
    priority: status === HealthStatus.CRITICAL ? RecommendationPriority.CRITICAL : RecommendationPriority.HIGH,
    actionType: ActionType.INSPECT,
    actionDueDays: status === HealthStatus.CRITICAL ? 1 : 3,
  });

  recommendations.push({
    title: "Schedule Service",
    description: "Perform preventive service based on current degradation indicators.",
    priority: RecommendationPriority.HIGH,
    actionType: ActionType.SERVICE,
    actionDueDays: status === HealthStatus.CRITICAL ? 1 : 5,
  });

  if (riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.SEVERE) {
    recommendations.push({
      title: "Calibrate and Update Software",
      description: "Calibrate sensors and update firmware/control software for better reliability.",
      priority: RecommendationPriority.MEDIUM,
      actionType: ActionType.UPDATE_SOFTWARE,
      actionDueDays: 7,
    });
  }

  if (status === HealthStatus.CRITICAL) {
    recommendations.push({
      title: "Replace Suspect Components",
      description: "Replace high-risk components identified by predictive model outputs.",
      priority: RecommendationPriority.CRITICAL,
      actionType: ActionType.REPLACE,
      actionDueDays: 1,
    });
  }

  return recommendations;
}

function toAlertSeverity(riskLevel: RiskLevel): AlertSeverity {
  switch (riskLevel) {
    case RiskLevel.SEVERE:
      return AlertSeverity.CRITICAL;
    case RiskLevel.HIGH:
      return AlertSeverity.HIGH;
    case RiskLevel.MODERATE:
      return AlertSeverity.MEDIUM;
    default:
      return AlertSeverity.LOW;
  }
}

export async function triggerPrediction(telemetry: TelemetryForPrediction) {
  const vehicle = await prisma.vehicle.findUnique({ where: { vehicleId: telemetry.vehicleId } });
  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  const predictionOutput = await predictVehicleHealth({
    engine_rpm: telemetry.engineRpm,
    lub_oil_pressure: telemetry.lubOilPressure,
    fuel_pressure: telemetry.fuelPressure,
    coolant_pressure: telemetry.coolantPressure,
    lub_oil_temp: telemetry.lubOilTemp,
    coolant_temp: telemetry.coolantTemp,
  });

  const prediction = await prisma.healthPrediction.create({
    data: {
      vehicleId: telemetry.vehicleId,
      telemetryId: telemetry.telemetryId,
      healthScore: predictionOutput.healthScore,
      status: predictionOutput.status,
      failureProbability: predictionOutput.failureProbability,
      riskLevel: predictionOutput.riskLevel,
      confidenceScore: predictionOutput.confidenceScore,
      predictedFailureDays: predictionOutput.predictedFailureDays,
      modelVersion: predictionOutput.modelVersion,
      diagnosticAnalysis: predictionOutput.diagnosticAnalysis,
      topInfluentialFeatures: predictionOutput.topInfluentialFeatures || [],
    },
  });

  const recommendationDrafts = buildRecommendations(prediction.status, prediction.riskLevel!);

  const recommendations = await Promise.all(
    recommendationDrafts.map((item) =>
      prisma.recommendation.create({
        data: {
          predictionId: prediction.predictionId,
          title: item.title,
          description: item.description,
          priority: item.priority,
          actionType: item.actionType,
          actionDueDays: item.actionDueDays,
        },
      })
    )
  );

  let alert = null;
  if (prediction.status !== HealthStatus.HEALTHY || prediction.riskLevel !== RiskLevel.LOW) {
    alert = await prisma.alert.create({
      data: {
        vehicleId: telemetry.vehicleId,
        predictionId: prediction.predictionId,
        alertType: "VEHICLE_HEALTH_RISK",
        severity: toAlertSeverity(prediction.riskLevel!),
        title: `Vehixa Risk Alert: ${prediction.status}`,
        message: `Vehicle ${vehicle.vehicleNumber ?? vehicle.vehicleId} is in ${prediction.status} state with ${Math.round((prediction.failureProbability ?? 0) * 100)}% failure probability.`,
      },
    });
  }

  return {
    prediction,
    recommendations,
    alert,
  };
}

export async function processBacklogTelemetry() {
  const unpredictedTelemetry = await prisma.telemetry.findMany({
    where: {
      healthPrediction: null,
    },
    orderBy: { recordedAt: "asc" },
    take: 50,
  });

  if (unpredictedTelemetry.length === 0) {
    return;
  }

  for (const telemetry of unpredictedTelemetry) {
    try {
      await triggerPrediction({
        telemetryId: telemetry.telemetryId,
        vehicleId: telemetry.vehicleId,
        engineRpm: telemetry.rpm,
        lubOilPressure: telemetry.oilPressure,
        fuelPressure: undefined,
        coolantPressure: telemetry.coolantLevel,
        lubOilTemp: telemetry.engineTemp,
        coolantTemp: undefined,
      });
    } catch (error) {
      logger.error("Failed to process telemetry backlog item", {
        telemetryId: telemetry.telemetryId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
