import { NextFunction, Request, Response } from 'express';
import { contactService } from './contact.service';

export const contactController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, phone, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: name, email, subject, message',
        });
      }

      const contact = await contactService.create({
        name,
        email,
        phone,
        subject,
        message,
      });

      res.status(201).json({
        success: true,
        message: 'Contact message received. We will get back to you soon!',
        data: contact,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, email } = req.query;
      const contacts = await contactService.getAll({
        status: status as string,
        email: email as string,
      });

      res.status(200).json({
        success: true,
        data: contacts,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const contact = await contactService.getById(String(id));

      // Mark as read
      await contactService.markAsRead(String(id));

      res.status(200).json({
        success: true,
        data: contact,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['PENDING', 'REPLIED', 'RESOLVED'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be PENDING, REPLIED, or RESOLVED',
        });
      }

      const contact = await contactService.updateStatus(String(id), status);

      res.status(200).json({
        success: true,
        message: 'Status updated successfully',
        data: contact,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await contactService.delete(String(id));

      res.status(200).json({
        success: true,
        message: 'Contact message deleted',
      });
    } catch (error) {
      next(error);
    }
  },
};
