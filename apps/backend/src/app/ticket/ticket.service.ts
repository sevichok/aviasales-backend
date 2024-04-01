import { Injectable } from '@nestjs/common';
import { Ticket, User } from '@prisma/client';
import { TicketReposService } from '@/backend/domain/repos/ticket-repos.service';
import { FlightsReposService } from '@/backend/domain/repos/flights-repos.service';
import { PaginatedQueryDto } from './domain/paginatedQuery.dto';

@Injectable()
export class TicketService {
  constructor(
    private ticketRepo: TicketReposService,
    private flightRepo: FlightsReposService,
  ) {}

  async getAllTickets(paginatedQuery: PaginatedQueryDto) {
    return await this.ticketRepo.getAllTickets(paginatedQuery)
  }

  async getTicketById({ id }: Pick<Ticket, "id">) {
    return await this.ticketRepo.getTicketById({ id });
  }

  async getTicketsByUserId({ user_id }: Pick<Ticket, "user_id">) {
    return await this.ticketRepo.getTicketsByUserId({ user_id });
  }

  async getTicketsByFlightId({ flight_id }: Pick<Ticket, "flight_id">) {
    return await this.ticketRepo.getTicketsByFlightId({ flight_id });
  }

  async deleteTicketById(user: User, { id }: Pick<Ticket, "id">) {
    return await this.ticketRepo.deleteTicketById(user, { id });
  }

  async getActiveTicketsByUserId(data: Pick<User, "id">) {
    return await this.ticketRepo.getActiveTicketsByUserId(data);
  }
  async getTicketsInCartByUserId(user: User) {
    return await this.ticketRepo.getTicketsInCartByUserId(user);
  }
  async updateTicketsStatus(ticket: Ticket[]) {
    return await this.ticketRepo.updateTicketsStatus(ticket);
  }

  async deleteOrderedTicketById(user: User, { id }: Pick<Ticket, "id">) {
    const deletedTicket = await this.ticketRepo.deleteOrderedTicketById(user, {
      id,
    });
    await this.flightRepo.incrementAvailableSeats(deletedTicket);
    return deletedTicket;
  }
  async updateTicketStatusById(data: Pick<Ticket, "id" | "status">) {
    return await this.ticketRepo.updateTicketStatusById(data);
  }

  async updateTicketHolderCredsById(
    user: User,
    data: Pick<Ticket, "id" | "holder_first_name" | "holder_last_name">,
  ) {
    return await this.ticketRepo.updateTicketHolderCredsById(user, data);
  }

  async createTicket(
    data: Pick<Ticket, "holder_first_name" | "holder_last_name">,
    flights: string[],
    user: User,
  ) {
    return await this.ticketRepo.createTicket(data, flights, user);
  }
  async getRelevantFlightsById(flights: string[]) {
    return this.flightRepo.getRelevantFlightsById(flights);
  }

  async decrementAvailableSeats(tickets: Ticket[]) {
    return await this.flightRepo.decrementAvailableSeats(tickets);
  }
}
