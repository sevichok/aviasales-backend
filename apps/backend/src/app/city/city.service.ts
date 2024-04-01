import { Injectable } from '@nestjs/common';
import { City } from '@prisma/client';
import {CityReposService} from "@/backend/domain/repos/city-repos.service";

@Injectable()
export class CityService {
  constructor(private cityRepo: CityReposService) {}

  async getAllCities() {
    return await this.cityRepo.getAllCities();
  }

  async getCityById(id: Pick<City, 'id'>) {
    return await this.cityRepo.getCityById(id);
  }

  async deleteCityById(id: Pick<City, 'id'>) {
    return await this.cityRepo.deleteCityById(id);
  }

  async createNewCity(data: Pick<City, 'title'>) {
    return await this.cityRepo.createNewCity(data);
  }

  async getCityByTitle(title: Pick<City, 'title'>) {
    const city = await this.cityRepo.getCityByTitle(title);
    return city;
  }
}
