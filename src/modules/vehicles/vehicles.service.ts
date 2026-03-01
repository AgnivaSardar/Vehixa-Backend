import { prisma } from "../../config/db";
import { ApiError } from "../../middlewares/error.middleware";

export const vehiclesService = {
  async create(data: any) {
    return prisma.vehicle.create({ data });
  },

  async list(query: { userId?: string }) {
    return prisma.vehicle.findMany({
      where: query.userId ? { userId: query.userId } : undefined,
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(vehicleId: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { vehicleId },
      include: {
        healthRecords: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!vehicle) throw new ApiError("Vehicle not found", 404);
    return vehicle;
  },

  async update(vehicleId: string, data: any) {
    await this.getById(vehicleId);
    return prisma.vehicle.update({ where: { vehicleId }, data });
  },

  async remove(vehicleId: string) {
    await this.getById(vehicleId);
    await prisma.vehicle.delete({ where: { vehicleId } });
    return { message: "Vehicle deleted" };
  },
};
