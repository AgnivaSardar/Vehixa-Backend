import { NextFunction, Request, Response } from "express";
import { recommendationsService } from "./recommendations.service";

export const recommendationsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await recommendationsService.list({
        vehicleId: req.query.vehicleId as string | undefined,
        predictionId: req.query.predictionId as string | undefined,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await recommendationsService.getById(String(req.params.recommendationId));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
