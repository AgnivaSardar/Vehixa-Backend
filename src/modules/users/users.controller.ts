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

  async sendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }

      const result = await usersService.sendLoginOTP(email);
      res.status(200).json({
        success: true,
        message: result.message,
        userExists: result.userExists,
        ...(process.env.NODE_ENV !== 'production' && result.otp && { otp: result.otp }),
      });
    } catch (error) {
      next(error);
    }
  },

  async verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, name, phone } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ 
          success: false, 
          message: "Email and OTP are required" 
        });
      }

      // Name is always required since OTP is only for new user registration
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Name is required for registration"
        });
      }

      const result = await usersService.verifyLoginOTP(email, otp, {
        name,
        phone,
      });

      res.status(200).json({
        success: true,
        message: "Registration successful! Welcome to Vehixa.",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },
};
