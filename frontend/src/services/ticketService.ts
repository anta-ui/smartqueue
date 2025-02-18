// services/ticket.service.ts
import {api} from './api';
import { Ticket, TicketStatus } from '../types/ticket.types';

const ticketService = {
  createTicket: async (data: Partial<Ticket>) => {
    const response = await api.post<Ticket>('/tickets/', data);
    return response.data;
  },

  getTicketsByQueue: async (queueId: number) => {
    const response = await api.get<Ticket[]>(`/tickets/?queue=${queueId}`);
    return response.data;
  },

  updateTicketStatus: async (id: number, status: TicketStatus) => {
    const response = await api.post<Ticket>(
      `/tickets/${id}/update_status/`,
      { status }
    );
    return response.data;
  },
};

export default ticketService;