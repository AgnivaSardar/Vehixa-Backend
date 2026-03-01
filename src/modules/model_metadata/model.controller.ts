import { NextFunction, Request, Response } from "express";
import { modelService } from "./model.service";

export const modelController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await modelService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await modelService.list();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getByVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await modelService.getByVersion(String(req.params.version));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async latest(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await modelService.latest();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
