import { Module } from "@nestjs/common";
import { SecurityModule } from "@app/security";
import { ConfigModule, ConfigService } from "@nestjs/config";
import config_app from "@app/security/config/app.config";
import config_i18n from "@app/security/config/i18n.config";
import config_security from "@app/security/config/security.config";
import { AcceptLanguageResolver, I18nModule, QueryResolver } from "nestjs-i18n";
import { ChatGateway } from "./chat.gateway";
import { RedisModule } from "@app/redis";
import { PrismaModule } from "@app/prisma";

@Module({
  imports: [
    RedisModule,
    SecurityModule,
    PrismaModule,
    ConfigModule.forRoot({
      envFilePath: ".env",
      load: [config_app, config_i18n, config_security],
      isGlobal: true,
    }),
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      resolvers: [
        { use: QueryResolver, options: ["lang"] },
        AcceptLanguageResolver,
      ],
      useFactory: (config: ConfigService) => config.get("i18n"),
    }),
  ],
  providers: [
    ChatGateway
  ],
})
export class ChatGatewayModule {}
