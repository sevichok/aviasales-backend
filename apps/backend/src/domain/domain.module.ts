import { Module } from '@nestjs/common';
import { UsersReposService } from './repos/user-repos.service';
import { RolesReposService } from './repos/roles-repos.service';
import { DeviceReposService } from './repos/device-repos.service';
import { CityReposService } from './repos/city-repos.service';
import { FlightsReposService } from './repos/flights-repos.service';
import { TicketReposService } from './repos/ticket-repos.service';
import {PrismaModule} from "@app/prisma";

@Module({
  imports: [PrismaModule],
  providers: [
    UsersReposService,
    RolesReposService,
    DeviceReposService,
    CityReposService,
    FlightsReposService,
    TicketReposService,
  ],
  exports: [
    UsersReposService,
    RolesReposService,
    DeviceReposService,
    CityReposService,
    FlightsReposService,
    TicketReposService,
  ],
})
export class DomainModule {}
