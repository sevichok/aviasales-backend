import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import {ConfigModule} from "@nestjs/config";
import config_app from "@app/security/config/app.config";
import config_i18n from "@app/security/config/i18n.config";
import config_security from "@app/security/config/security.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      load: [config_app, config_i18n, config_security]
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
