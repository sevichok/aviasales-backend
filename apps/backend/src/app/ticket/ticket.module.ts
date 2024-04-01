import { Module } from "@nestjs/common";
import { TicketService } from "./ticket.service";
import { TicketController } from "./ticket.controller";
import { SecurityModule } from "@app/security";
import { DomainModule } from "@/backend/domain";

@Module({
  imports: [DomainModule, SecurityModule],
  providers: [TicketService],
  controllers: [TicketController],
})
export class TicketModule {}
