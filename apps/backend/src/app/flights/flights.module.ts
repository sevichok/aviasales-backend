import { Module } from "@nestjs/common";
import { FlightsService } from "./flights.service";
import { FlightsController } from "./flights.controller";
import { SecurityModule } from "@app/security";
import { DomainModule } from "@/backend/domain";

@Module({
  imports: [DomainModule, SecurityModule],
  providers: [FlightsService],
  controllers: [FlightsController],
})
export class FlightsModule {}
