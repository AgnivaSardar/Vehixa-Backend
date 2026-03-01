import { NextFunction, Request, Response } from "express";
import { alertsService } from "./alerts.service";

export const alertsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await alertsService.list({
        vehicleId: req.query.vehicleId as string | undefined,
        severity: req.query.severity as string | undefined,
        isResolved: req.query.isResolved as string | undefined,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await alertsService.getById(String(req.params.alertId));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async resolve(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await alertsService.resolve(String(req.params.alertId));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
