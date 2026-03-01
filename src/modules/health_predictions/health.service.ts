import { prisma } from "../../config/db";
import { ApiError } from "../../middlewares/error.middleware";

export const healthService = {
  async list(vehicleId?: string) {
    return prisma.healthPrediction.findMany({
      where: vehicleId ? { vehicleId } : undefined,
      include: {
        telemetry: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(predictionId: string) {
    const prediction = await prisma.healthPrediction.findUnique({
      where: { predictionId },
      include: {
        telemetry: true,
        recommendations: true,
        alerts: true,
      },
    });

    if (!prediction) throw new ApiError("Prediction not found", 404);
    return prediction;
  },
};
