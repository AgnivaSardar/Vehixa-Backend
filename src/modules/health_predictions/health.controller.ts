import { NextFunction, Request, Response } from "express";
import { healthService } from "./health.service";

export const healthController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await healthService.list(req.query.vehicleId as string | undefined);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await healthService.getById(String(req.params.predictionId));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async evaluateLive(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId, ...telemetryData } = req.body;
      
      if (!vehicleId) {
        return res.status(400).json({ message: "vehicleId is required" });
      }
      
      const result = await healthService.evaluateLive(vehicleId, telemetryData);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
