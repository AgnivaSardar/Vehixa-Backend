import { prisma } from "../../config/db";
import { Role } from "../../generated/prisma/enums";
import { signToken } from "../../utils/jwt";
import { comparePassword, hashPassword } from "../../utils/password";
import { ApiError } from "../../middlewares/error.middleware";
import { otpService } from "../../utils/otpService";
import { emailService } from "../../utils/emailService";

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

  // OTP-based authentication methods (for new user registration only)
  async sendLoginOTP(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (user) {
      // User already exists - OTP is only for registration
      throw new ApiError("User already exists. Please use password login.", 400);
    }

    // User doesn't exist - send OTP for new registration
    const { otp } = await otpService.sendOTP(email);
    const response: any = { 
      message: "OTP sent to email for new account registration.",
      userExists: false
    };
    if (process.env.NODE_ENV !== 'production') {
      response.otp = otp; // Debug only
    }
    return response;
  },

  async verifyLoginOTP(email: string, otp: string, userData?: { name: string; phone?: string }) {
    // Verify OTP
    const otpResult = await otpService.verifyOTP(email, otp);
    if (!otpResult.valid) {
      throw new ApiError(otpResult.message, 401);
    }

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    // OTP is only for new user registration
    if (user) {
      throw new ApiError("User already exists. Please use password login.", 400);
    }

    // Create new user (userData is required)
    if (!userData) {
      throw new ApiError("Registration details required for new user.", 400);
    }

    user = await prisma.user.create({
      data: {
        email,
        name: userData.name,
        phone: userData.phone,
        password: null,
        isVerified: true,
        role: Role.USER,
      },
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(email, user.name || undefined);

    const token = signToken({ userId: user.userId, role: user.role, email: user.email });

    return {
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
      },
      token,
      isNewUser: true,
    };
  },
};
