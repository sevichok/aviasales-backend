import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { SecurityModule } from "@app/security";
import { DomainModule } from "@/backend/domain";

@Module({
  imports: [DomainModule, SecurityModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
