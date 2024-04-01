import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./app/auth/auth.module";
import { CityModule } from "./app/city/city.module";
import { FlightsModule } from "./app/flights/flights.module";
import { UserModule } from "./app/user/user.module";
import { TicketModule } from "./app/ticket/ticket.module";
import config_app from "@app/security/config/app.config";
import config_i18n from "@app/security/config/i18n.config";
import config_security from "@app/security/config/security.config";
import { AcceptLanguageResolver, I18nModule, QueryResolver } from "nestjs-i18n";
import { APP_FILTER } from "@nestjs/core";
import {SecurityModule} from "@app/security";
import {PrismaClientExceptionFilter} from "@app/exceptions/global-exception.filter";
import { DevicesModule } from "./app/devices/devices.module";

@Module({
  imports: [
    AuthModule,
    CityModule,
    FlightsModule,
    UserModule,
    TicketModule,
    SecurityModule,
    DevicesModule,
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
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
  ],
})
export class AppModule {}
