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
};
