import { Injectable } from '@nestjs/common';
import {
  City,
  Flight,
  FlightStatus,
  Plane,
  Ticket,
} from '@prisma/client';
import { PrismaService } from "@app/prisma";
const seats_in_one_ticket = 1
const includingData = () => {
  return {
    include: {
      plane: true,
      from_city: true,
      to_city: true,
    },
  } as const;
};

@Injectable()
export class FlightsReposService {
  constructor(private prisma: PrismaService) { }
  async createFlight(
    from_city: City,
    to_city: City,
    plane: Plane,
    { price }: Pick<Flight, 'price'>
  ) {
    return this.prisma.flight.create({
      data: {
        from_city_id: from_city.id,
        to_city_id: to_city.id,
        start_flight_date: new Date(),
        end_flight_date: new Date(),
        status: FlightStatus.Planned,
        price,
        available_seats: plane.seats,
        plane_id: plane.id,
      },
    });
  }
  async changeFlightStatus(data: Pick<Flight, 'id' | 'status'>) {
    return this.prisma.flight.update({
      where: { id: data.id },
      data: {
        status: data.status,
      },
      ...includingData(),
    });
  }

  async changeFlightPrice(data: Pick<Flight, 'id' | 'price'>) {
    return this.prisma.flight.update({
      where: { id: data.id },
      data: {
        price: data.price,
      },
      ...includingData(),
    });
  }
  async decrementAvailableSeats(
    tickets: Ticket[]
  ) {
    return await this.prisma.$transaction(async (tx) => {
      try {
        return await Promise.all(tickets.map(async (ticket) => {
          return tx.flight.update({
            where: {
              id: ticket.flight_id,
              available_seats: { gte: seats_in_one_ticket },
            },
            data: {
              available_seats: { decrement: seats_in_one_ticket },
            },
            ...includingData(),
          });
        }))
      } catch (error) {
        return
      }
    })


  }
  async incrementAvailableSeats(
    ticket: Ticket
  ) {
    return await this.prisma.flight.update({
      where: {
        id: ticket.flight_id
      },
      data: {
        available_seats: {
          increment: seats_in_one_ticket
        }
      }
    })


  }
  async getAllFlights(
    data: Pick<Flight, 'start_flight_date' | 'from_city_id'>
  ) {
    const next_day_date = new Date(data.start_flight_date);
    next_day_date.setDate(next_day_date.getDate() + 1);
    return this.prisma.flight.findMany({
      where: {
        OR: [
          {
            start_flight_date: {
              gte: data.start_flight_date,
              lte: next_day_date,
            },
            from_city_id: data.from_city_id,
          },
          {
            from_city_id: {
              not: data.from_city_id,
            },
            start_flight_date: {
              gte: data.start_flight_date,
            },
          },
        ],
      },
      ...includingData(),
    });
  }
  async getFlightById({ id }: Pick<Flight, 'id'>) {
    return this.prisma.flight.findUnique({
      where: { id },
      ...includingData(),
    });
  }
  async deleteFlight(
    { id }: Pick<Flight, 'id'>,
  ) {
    return this.prisma.flight.delete({
      where: { id },
    });
  }

  async getRelevantFlightsById(flights: string[]) {
    return this.prisma.flight.findMany({
      where: {
        id: {
          in: flights
        },
        available_seats: {
          gte: seats_in_one_ticket,
        },
      },
      ...includingData(),
    });
  }

}
