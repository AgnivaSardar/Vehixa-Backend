import { NextFunction, Request, Response } from "express";
import { vehiclesService } from "./vehicles.service";

export const vehiclesController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Add userId from authenticated user
      const vehicleData = {
        ...req.body,
        userId: req.user?.userId,
      };
      const vehicle = await vehiclesService.create(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await vehiclesService.list({ userId: req.query.userId as string | undefined });
      res.status(200).json(vehicles);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehiclesService.getById(String(req.params.vehicleId));
      res.status(200).json(vehicle);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehiclesService.update(String(req.params.vehicleId), req.body);
      res.status(200).json(vehicle);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await vehiclesService.remove(String(req.params.vehicleId));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
