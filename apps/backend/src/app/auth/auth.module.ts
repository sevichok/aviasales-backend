import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {SecurityModule, SecurityService} from "@app/security";
import {DomainModule} from "@/backend/domain";

@Module({
  imports: [DomainModule,SecurityModule],
  providers: [AuthService,SecurityService],
  controllers: [AuthController]
})
export class AuthModule {}
