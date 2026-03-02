import { prisma } from "../../config/db";
import { ApiError } from "../../middlewares/error.middleware";
import { triggerPrediction } from "../../jobs/processTelemetry.job";

interface TelemetryData {
  vehicleId: string;
  engine_rpm?: number;
  lub_oil_pressure?: number;
  fuel_pressure?: number;
  coolant_pressure?: number;
  lub_oil_temp?: number;
  coolant_temp?: number;
  [key: string]: any;
}

export const telemetryService = {
  async ingest(data: TelemetryData) {
    const vehicle = await prisma.vehicle.findUnique({ where: { vehicleId: data.vehicleId } });
    if (!vehicle) throw new ApiError("Vehicle not found", 404);

    // Map ML parameter names to telemetry table fields
    const telemetry = await prisma.telemetry.create({
      data: {
        vehicleId: data.vehicleId,
        source: data.source || 'API_PUSH',
        engineTemp: data.lub_oil_temp,
        batteryVoltage: undefined,
        rpm: data.engine_rpm,
        oilPressure: data.lub_oil_pressure,
        mileage: undefined,
        vibrationLevel: undefined,
        fuelEfficiency: undefined,
        errorCodesCount: undefined,
        ambientTemperature: undefined,
        coolantLevel: data.coolant_pressure,
        recordedAt: new Date(),
      },
    });
    
    const { prediction, recommendations, alert } = await triggerPrediction({
      telemetryId: telemetry.telemetryId,
      vehicleId: data.vehicleId,
      engineRpm: data.engine_rpm || null,
      lubOilPressure: data.lub_oil_pressure || null,
      fuelPressure: data.fuel_pressure || null,
      coolantPressure: data.coolant_pressure || null,
      lubOilTemp: data.lub_oil_temp || null,
      coolantTemp: data.coolant_temp || null,
    });

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
