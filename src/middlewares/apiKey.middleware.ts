import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";

export const verifyVehicleApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKeyHeader = req.headers["x-api-key"];
  const apiKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;
  const vehicleId = req.body?.vehicleId;

  if (!apiKey) {
    return res.status(401).json({ message: "API Key missing" });
  }

  if (!vehicleId || typeof vehicleId !== "string") {
    return res.status(400).json({ message: "vehicleId is required" });
  }

  const keyRecord = await prisma.vehicleApiKey.findUnique({
    where: { apiKey },
  });

  if (!keyRecord || !keyRecord.isActive) {
    return res.status(403).json({ message: "Invalid API Key" });
  }

  if (keyRecord.vehicleId !== vehicleId) {
    return res.status(403).json({ message: "API Key does not match vehicle" });
  }

  next();
};