import { prisma } from "../../config/db";
import { Role } from "../../generated/prisma/enums";
import { signToken } from "../../utils/jwt";
import { comparePassword, hashPassword } from "../../utils/password";
import { ApiError } from "../../middlewares/error.middleware";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role?: Role;
};

export const usersService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ApiError("Email already in use", 409);

    const password = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password,
        role: input.role ?? Role.USER,
      },
      omit: { password: true },
    });

    const token = signToken({ userId: user.userId, role: user.role, email: user.email });
    return { user, token };
  },

  async login(email: string, plainPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ApiError("Invalid email or password", 401);

    const isValid = await comparePassword(plainPassword, user.password);
    if (!isValid) throw new ApiError("Invalid email or password", 401);

    const token = signToken({ userId: user.userId, role: user.role, email: user.email });

    return {
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      token,
    };
  },

  async getById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { userId },
      omit: { password: true },
    });

    if (!user) throw new ApiError("User not found", 404);
    return user;
  },

  async list() {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      omit: { password: true },
    });
  },
};
