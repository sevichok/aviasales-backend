import { Module } from "@nestjs/common";
import { DevicesService } from "./devices.service";
import { DevicesController } from "./devices.controller";
import { SecurityModule } from "@app/security";
import { DomainModule } from "@/backend/domain";

@Module({
  imports: [DomainModule, SecurityModule],
  providers: [DevicesService],
  controllers: [DevicesController],
})
export class DevicesModule {}
