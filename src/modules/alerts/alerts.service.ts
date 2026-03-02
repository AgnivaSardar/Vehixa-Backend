import { prisma } from "../../config/db";
import { ApiError } from "../../middlewares/error.middleware";

export const alertsService = {
  async list(filters: { vehicleId?: string; severity?: string; isResolved?: string }) {
    return prisma.alert.findMany({
      where: {
        vehicleId: filters.vehicleId,
        severity: (filters.severity as any) || undefined,
        isResolved:
          filters.isResolved == null
            ? undefined
            : filters.isResolved === "true"
              ? true
              : false,
      },
      include: {
        healthPrediction: true,
      },
      orderBy: [{ isResolved: "asc" }, { createdAt: "desc" }],
    });
  },

  async getById(alertId: string) {
    const alert = await prisma.alert.findUnique({
      where: { alertId },
      include: {
        healthPrediction: true,
        vehicle: true,
      },
    });

    if (!alert) throw new ApiError("Alert not found", 404);
    return alert;
  },

  async resolve(alertId: string) {
    await this.getById(alertId);
    return prisma.alert.update({
      where: { alertId },
      data: { isResolved: true },
    });
  },

  async create(data: {
    vehicleId: string;
    predictionId: string;
    alertType: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    message: string;
  }) {
    return prisma.alert.create({
      data: {
        vehicleId: data.vehicleId,
        predictionId: data.predictionId,
        alertType: data.alertType,
        severity: data.severity,
        title: data.title,
        message: data.message,
        isResolved: false,
      },
      include: {
        vehicle: true,
        healthPrediction: true,
      },
    });
  },
};
