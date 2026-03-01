import { prisma } from "../../config/db";
import { ApiError } from "../../middlewares/error.middleware";

export const modelService = {
  async create(data: any) {
    return prisma.modelMetadata.create({
      data: {
        ...data,
        trainedOn: data.trainedOn ? new Date(data.trainedOn) : undefined,
      },
    });
  },

  async list() {
    return prisma.modelMetadata.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async getByVersion(version: string) {
    const model = await prisma.modelMetadata.findUnique({ where: { version } });
    if (!model) throw new ApiError("Model metadata not found", 404);
    return model;
  },

  async latest() {
    return prisma.modelMetadata.findFirst({
      orderBy: [{ trainedOn: "desc" }, { createdAt: "desc" }],
    });
  },
};
