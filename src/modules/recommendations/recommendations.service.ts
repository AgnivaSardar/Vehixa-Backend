import { prisma } from "../../config/db";
import { ApiError } from "../../middlewares/error.middleware";

export const recommendationsService = {
  async list(filters: { vehicleId?: string; predictionId?: string }) {
    return prisma.recommendation.findMany({
      where: {
        predictionId: filters.predictionId,
        healthPrediction: filters.vehicleId ? { vehicleId: filters.vehicleId } : undefined,
      },
      include: {
        healthPrediction: true,
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
  },

  async getById(recommendationId: string) {
    const recommendation = await prisma.recommendation.findUnique({
      where: { recommendationId },
      include: {
        healthPrediction: {
          include: {
            telemetry: true,
          },
        },
      },
    });

    if (!recommendation) throw new ApiError("Recommendation not found", 404);
    return recommendation;
  },
};
