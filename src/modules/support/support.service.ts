// src/modules/support/support.service.ts
import Support from './support.model';

export default class SupportService {
  static async createTicket(userId: number, message: string) {
    return Support.create({ userId, message });
  }

  static async getUserTickets(userId: number) {
    return Support.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
  }

  static async getAllTickets() {
    return Support.findAll({ order: [['createdAt', 'DESC']] });
  }

  static async resolveTicket(id: number) {
    const ticket = await Support.findByPk(id);
    if (!ticket) throw new Error('Support ticket not found');
    ticket.status = 'resolved';
    return ticket.save();
  }
}
