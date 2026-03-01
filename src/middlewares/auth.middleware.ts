import { NextFunction, Request, Response } from "express";
import { Role } from "../generated/prisma/enums";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "./error.middleware";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError("Unauthorized", 401));
  }

  const token = header.replace("Bearer ", "").trim();

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    next(new ApiError("Invalid or expired token", 401));
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next();
  }

  try {
    const token = header.replace("Bearer ", "").trim();
    req.user = verifyToken(token);
    next();
  } catch {
    next();
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError("Unauthorized", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError("Forbidden", 403));
    }

    next();
  };
}
