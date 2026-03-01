import { prisma } from "../config/db";
import { telemetryService } from "../modules/telemetry/telemetry.service";
import { logger } from "../utils/logger";

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
      await telemetryService.ingest({
        vehicleId: telemetry.vehicleId,
        source: telemetry.source,
        engineTemp: telemetry.engineTemp,
        batteryVoltage: telemetry.batteryVoltage,
        rpm: telemetry.rpm,
        oilPressure: telemetry.oilPressure,
        mileage: telemetry.mileage,
        vibrationLevel: telemetry.vibrationLevel,
        fuelEfficiency: telemetry.fuelEfficiency,
        errorCodesCount: telemetry.errorCodesCount,
        ambientTemperature: telemetry.ambientTemperature,
        coolantLevel: telemetry.coolantLevel,
        recordedAt: telemetry.recordedAt,
      });
    } catch (error) {
      logger.error("Failed to process telemetry backlog item", {
        telemetryId: telemetry.telemetryId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
