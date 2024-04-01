import { Injectable } from '@nestjs/common';
import { Ticket, User, TicketStatus } from '@prisma/client';
import { PrismaService } from "@app/prisma";
import { PaginatedQueryDto } from '@/backend/app/user/domain/paginatedQuery.dto';

const includingData = () => {
  return {
    include: {
      flight: {
        include: {
          plane: true,
          from_city: true,
          to_city: true,
        },
      },
    },
  } as const;
};
@Injectable()
export class TicketReposService {
  constructor(private prisma: PrismaService) { }


  async getAllTickets({ pageNumber, pageSize }: PaginatedQueryDto) {
    const skip = (pageNumber - 1) * pageSize;

    const tickets = await this.prisma.ticket.findMany({
      where: {
        status: {
          not: TicketStatus.InCart
        }
      },
      take: pageSize,
      skip,
      ...includingData(),
    });
    const totalTicketCount = await this.prisma.ticket.count({where: {
      status: {
        not: TicketStatus.InCart
      }
    }})
    return { totalTicketCount, tickets }
  }

  async getTicketById({ id }: Pick<Ticket, 'id'>) {
    return await this.prisma.ticket.findUnique({
      where: { id },
      ...includingData(),
    });
  }

  async getTicketsByUserId({ user_id }: Pick<Ticket, 'user_id'>) {
    return await this.prisma.ticket.findMany({
      where: { user_id, status: { not: TicketStatus.InCart } },
      ...includingData(),
    });
  }

  async getActiveTicketsByUserId({ id }: Pick<User, 'id'>) {
    return await this.prisma.ticket.findMany({
      where: { user_id: id, status: { not: TicketStatus.InCart } },
      orderBy: {
        status: "desc"
      },
      ...includingData(),
    });
  }


  async updateTicketsStatus(tickets: Ticket[]) {
    return this.prisma.ticket.updateMany({
      where: {
        id: {
          in: tickets.map(ticket => ticket.id)
        }
      },
      data: {
        status: TicketStatus.Ordered
      }
    })
  }
  async getTicketsInCartByUserId({ id }: Pick<User, 'id'>) {
    return await this.prisma.ticket.findMany({
      where: { user_id: id, status: TicketStatus.InCart },
      ...includingData()
    });
  }

  async getTicketsByFlightId({ flight_id }: Pick<Ticket, 'flight_id'>) {
    return await this.prisma.ticket.findMany({
      where: { flight_id },
      ...includingData(),
    });
  }

  async deleteTicketById(user: User, { id }: Pick<Ticket, 'id'>) {
    return await this.prisma.ticket.delete({
      where: { id, user_id: user.id },
      ...includingData(),
    });
  }

  async deleteOrderedTicketById(user: User, { id }: Pick<Ticket, 'id'>) {
    return await this.prisma.ticket.delete({
      where: { id, user_id: user.id, status: TicketStatus.Ordered },
      ...includingData(),
    });
  }

  async updateTicketStatusById(data: Pick<Ticket, 'id' | 'status'>) {
    const ticket = await this.prisma.ticket.update({
      where: { id: data.id },
      data: { status: data.status },
      ...includingData(),
    });
    return ticket;
  }

  async updateTicketHolderCredsById(
    user: User,
    data: Pick<Ticket, 'id' | 'holder_first_name' | 'holder_last_name'>
  ) {
    const ticket = await this.prisma.ticket.update({
      where: {
        id: data.id,
        user_id: user.id,
      },
      data: {
        holder_first_name: data.holder_first_name,
        holder_last_name: data.holder_last_name,
      },
      ...includingData(),
    });
    return ticket;
  }

  async createTicket(
    data: Pick<Ticket, 'holder_first_name' | 'holder_last_name'>,
    flights: string[],
    user: User
  ) {
    return await this.prisma.$transaction(async (tx) => {
      try {
        return await Promise.all(flights.map(async (flight_id) => {
          return await this.prisma.ticket.create({
            data: {
              user_id: user.id,
              holder_first_name: data.holder_first_name,
              holder_last_name: data.holder_last_name,
              flight_id: flight_id,
              status: TicketStatus.InCart,
            },
            ...includingData()
          });
        }))
      } catch (error) {

      }
    })

  }
}
