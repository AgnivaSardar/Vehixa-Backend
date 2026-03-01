import { prisma } from "../../config/db";
import {
  ActionType,
  AlertSeverity,
  HealthStatus,
  RecommendationPriority,
  RiskLevel,
} from "../../generated/prisma/enums";
import { ApiError } from "../../middlewares/error.middleware";
import { predictVehicleHealth } from "../../utils/mlClient";

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

export const telemetryService = {
  async ingest(data: any) {
    const vehicle = await prisma.vehicle.findUnique({ where: { vehicleId: data.vehicleId } });
    if (!vehicle) throw new ApiError("Vehicle not found", 404);

    const telemetry = await prisma.telemetry.create({ data });

    const predictionOutput = predictVehicleHealth({
      engineTemp: telemetry.engineTemp,
      batteryVoltage: telemetry.batteryVoltage,
      rpm: telemetry.rpm,
      oilPressure: telemetry.oilPressure,
      mileage: telemetry.mileage,
      vibrationLevel: telemetry.vibrationLevel,
      errorCodesCount: telemetry.errorCodesCount,
      coolantLevel: telemetry.coolantLevel,
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
      telemetry,
      prediction,
      recommendations,
      alert,
    };
  },

  async list(vehicleId?: string) {
    return prisma.telemetry.findMany({
      where: vehicleId ? { vehicleId } : undefined,
      include: {
        healthPrediction: true,
      },
      orderBy: { recordedAt: "desc" },
    });
  },

  async getById(telemetryId: string) {
    const telemetry = await prisma.telemetry.findUnique({
      where: { telemetryId },
      include: {
        healthPrediction: {
          include: {
            recommendations: true,
            alerts: true,
          },
        },
      },
    });

    if (!telemetry) throw new ApiError("Telemetry not found", 404);
    return telemetry;
  },
};
