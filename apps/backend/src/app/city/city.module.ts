import { Module } from '@nestjs/common';
import { CityService } from './city.service';
import { CityController } from './city.controller';
import {SecurityModule} from "@app/security";
import {DomainModule} from "@/backend/domain";

@Module({
  imports: [DomainModule, SecurityModule],
  providers: [CityService],
  controllers: [CityController],
})
export class CityModule {}
