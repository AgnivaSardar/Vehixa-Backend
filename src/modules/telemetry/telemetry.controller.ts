import { NextFunction, Request, Response } from "express";
import { telemetryService } from "./telemetry.service";

export const telemetryController = {
  async ingest(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await telemetryService.ingest(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicleId = req.query.vehicleId as string | undefined;
      const result = await telemetryService.list(vehicleId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await telemetryService.getById(String(req.params.telemetryId));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
