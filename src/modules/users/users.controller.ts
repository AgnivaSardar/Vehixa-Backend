import { NextFunction, Request, Response } from "express";
import { usersService } from "./users.service";

export const usersController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usersService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usersService.login(req.body.email, req.body.password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.getById(req.user!.userId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await usersService.list();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  },
};
