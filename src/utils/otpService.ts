import { prisma } from '../config/db';
import { emailService } from './emailService';
import { logger } from './logger';

export const otpService = {
  async generateOTP(length: number = 6): Promise<string> {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1))
      .toString()
      .substring(0, length);
  },

  async sendOTP(email: string, name?: string): Promise<{ otp: string }> {
    try {
      // Generate 6-digit OTP
      const otp = await this.generateOTP(6);
      
      // OTP expires in 10 minutes
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Delete any existing OTPs for this email
      await prisma.oTPVerification.deleteMany({
        where: { email, isUsed: false },
      });

      // Store OTP in database
      await prisma.oTPVerification.create({
        data: {
          email,
          otp,
          expiresAt,
        },
      });

      // Send OTP via email
      await emailService.sendOTP(email, otp, name);

      logger.info(`OTP sent to ${email}`);
      return { otp }; // For development testing - remove in production
    } catch (error) {
      logger.error(`Failed to send OTP to ${email}:`, error);
      throw error;
    }
  },

  async verifyOTP(email: string, otp: string): Promise<{ valid: boolean; message: string }> {
    try {
      const otpRecord = await prisma.oTPVerification.findFirst({
        where: {
          email,
          otp,
          isUsed: false,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord) {
        return { valid: false, message: 'Invalid OTP' };
      }

      // Check if OTP expired
      if (new Date() > otpRecord.expiresAt) {
        return { valid: false, message: 'OTP expired' };
      }

      // Mark OTP as used
      await prisma.oTPVerification.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      return { valid: true, message: 'OTP verified successfully' };
    } catch (error) {
      logger.error(`Failed to verify OTP for ${email}:`, error);
      throw error;
    }
  },

  async getOTPAttempts(email: string): Promise<number> {
    const otpRecord = await prisma.oTPVerification.findFirst({
      where: { email, isUsed: false },
      orderBy: { createdAt: 'desc' },
    });

    return otpRecord?.attempts || 0;
  },

  async incrementOTPAttempts(email: string): Promise<void> {
    const otpRecord = await prisma.oTPVerification.findFirst({
      where: { email, isUsed: false },
      orderBy: { createdAt: 'desc' },
    });

    if (otpRecord) {
      await prisma.oTPVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });
    }
  },
};
