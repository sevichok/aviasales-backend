import { Injectable } from '@nestjs/common';
import { City } from '@prisma/client';
import {PrismaService} from "@app/prisma";

@Injectable()
export class CityReposService {
  constructor(private prisma: PrismaService) {}

  async getAllCities() {
    return await this.prisma.city.findMany();
  }

  async getCityById({ id }: Pick<City, 'id'>) {
    return await this.prisma.city.findUnique({
      where: {
        id,
      },
      include: {
        flights_from_city: true,
        flights_to_city: true,
      },
    });
  }

  async deleteCityById({ id }: Pick<City, 'id'>) {
    return await this.prisma.city.delete({
      where: { id },
    });
  }

  async createNewCity(data: Pick<City, 'title'>) {
    const { title } = data;
    const newCity = await this.prisma.city.create({
      data: { title },
    });
    return newCity;
  }

  async getCityByTitle(title: Pick<City, 'title'>) {
    return this.prisma.city.findFirst({
      where: { ...title },
    });
  }
}
