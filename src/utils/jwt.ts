import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Role } from "../generated/prisma/enums";

type JwtPayload = {
  userId: string;
  role: Role;
  email?: string;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
