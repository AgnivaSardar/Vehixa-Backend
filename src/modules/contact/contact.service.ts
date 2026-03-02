import { prisma } from '../../config/db';
import { ApiError } from '../../middlewares/error.middleware';

export const contactService = {
  async create(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) {
    try {
      return await prisma.contactMessage.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
          status: 'PENDING',
        },
      });
    } catch (error) {
      throw new ApiError('Failed to save contact message', 500);
    }
  },

  async getAll(filters?: { status?: string; email?: string }) {
    return await prisma.contactMessage.findMany({
      where: {
        status: filters?.status,
        email: filters?.email,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string) {
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new ApiError('Contact message not found', 404);
    }

    return message;
  },

  async updateStatus(id: string, status: 'PENDING' | 'REPLIED' | 'RESOLVED') {
    return await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });
  },

  async markAsRead(id: string) {
    return await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
  },

  async delete(id: string) {
    return await prisma.contactMessage.delete({
      where: { id },
    });
  },
};
