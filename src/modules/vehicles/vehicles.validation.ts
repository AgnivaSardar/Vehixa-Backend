import { z } from "zod";
import { EngineType, FuelType, VehicleOperationalStatus, VehicleType } from "../../generated/prisma/enums";

export const createVehicleSchema = z.object({
  vehicleNumber: z.string().min(3).optional(),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  year: z.number().int().min(1980).max(2100).optional(),
  vehicleType: z.nativeEnum(VehicleType).optional(),
  vin: z.string().min(8).max(32).optional(),
  engineType: z.nativeEnum(EngineType).optional(),
  fuelType: z.nativeEnum(FuelType),
  registrationDate: z.coerce.date().optional(),
  status: z.nativeEnum(VehicleOperationalStatus).optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();
