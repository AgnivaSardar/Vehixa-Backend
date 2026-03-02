import nodemailer from 'nodemailer';
import { logger } from './logger';

// For development, use ethereal email (temporary email service)
let transporter: any;

const initializeTransporter = async () => {
  if (!transporter) {
    try {
      // In production, use your email provider (Gmail, SendGrid, etc.)
      if (process.env.EMAIL_SERVICE === 'gmail') {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
      } else {
        // Development: use ethereal for testing
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
      throw error;
    }
  }
  return transporter;
};

export const emailService = {
  async sendOTP(email: string, otp: string, name?: string) {
    try {
      const transport = await initializeTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@vehixa.com',
        to: email,
        subject: 'Your Vehixa OTP Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00ff88; text-align: center;">Vehixa Vehicle Health AI</h2>
            
            <div style="background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%); padding: 30px; border-radius: 8px; color: #fff;">
              <p>Hello ${name || 'User'},</p>
              
              <p>Your OTP verification code is:</p>
              
              <div style="background: rgba(0, 255, 136, 0.1); border: 2px solid #00ff88; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #00ff88; margin: 0; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
              </div>
              
              <p style="color: #ff6b6b;">This code expires in 10 minutes.</p>
              
              <p>If you didn't request this code, please ignore this email.</p>
              
              <hr style="border: 1px solid rgba(255, 255, 255, 0.1); margin: 20px 0;">
              
              <p style="font-size: 12px; color: #999;">
                This is an automated message from Vehixa. Please do not reply to this email.
              </p>
            </div>
          </div>
        `,
      };

      const info = await transport.sendMail(mailOptions);
      
      logger.info(`OTP email sent to ${email}. Preview: ${nodemailer.getTestMessageUrl(info)}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Failed to send OTP email to ${email}:`, error);
      throw error;
    }
  },

  async sendWelcomeEmail(email: string, name?: string) {
    try {
      const transport = await initializeTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@vehixa.com',
        to: email,
        subject: 'Welcome to Vehixa - AI Vehicle Health Monitoring',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00ff88; text-align: center;">Welcome to Vehixa!</h2>
            
            <div style="background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%); padding: 30px; border-radius: 8px; color: #fff;">
              <p>Hello ${name || 'User'},</p>
              
              <p>Your account has been successfully created and verified. You can now access all the features of Vehixa:</p>
              
              <ul style="color: #00ff88;">
                <li>Real-time vehicle health monitoring</li>
                <li>AI-powered health evaluations</li>
                <li>Maintenance recommendations</li>
                <li>Critical alerts and notifications</li>
              </ul>
              
              <p style="margin-top: 20px;">Get started by logging in and adding your vehicle details.</p>
              
              <p style="margin-top: 20px; color: #999; font-size: 12px;">
                For support, please contact us at support@vehixa.com
              </p>
            </div>
          </div>
        `,
      };

      const info = await transport.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${email}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Failed to send welcome email to ${email}:`, error);
    }
  },

  async sendContactReplyEmail(email: string, subject: string, reply: string) {
    try {
      const transport = await initializeTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@vehixa.com',
        to: email,
        subject: `Re: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00ff88;">Vehixa Support Response</h2>
            
            <div style="background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%); padding: 30px; border-radius: 8px; color: #fff;">
              <p>Thank you for contacting us!</p>
              
              <p style="color: #00ff88;">Subject: ${subject}</p>
              
              <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-left: 3px solid #00ff88; margin: 20px 0;">
                ${reply}
              </div>
              
              <p>Best regards,<br>Vehixa Team</p>
            </div>
          </div>
        `,
      };

      const info = await transport.sendMail(mailOptions);
      logger.info(`Contact reply email sent to ${email}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Failed to send contact reply email to ${email}:`, error);
    }
  },
};
