import { z } from "zod";
import { TelemetrySource } from "../../generated/prisma/enums";

export const createTelemetrySchema = z.object({
  vehicleId: z.string().uuid(),
  source: z.nativeEnum(TelemetrySource).optional(),
  engineTemp: z.number().optional(),
  batteryVoltage: z.number().optional(),
  rpm: z.number().int().optional(),
  oilPressure: z.number().optional(),
  mileage: z.number().optional(),
  vibrationLevel: z.number().optional(),
  fuelEfficiency: z.number().optional(),
  errorCodesCount: z.number().int().optional(),
  ambientTemperature: z.number().optional(),
  coolantLevel: z.number().optional(),
  recordedAt: z.coerce.date(),
});
