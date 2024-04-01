import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from "@nestjs/common";
import { DevicesService } from "./devices.service";
import { ApiRequestException } from "@app/exceptions/api-request-exception";
import { ApiResponse } from "@nestjs/swagger";
import { User, UserPermissions } from "@prisma/client";
import { SignoutForm } from "../auth/domain/Signout.form";
import { DevicesDto } from "./domain/devices.dto";
import { CurrentUser, JwtAuthGuard } from "@app/security/guards/security.guard";
import { RequirePermissions } from "@app/security/decorators/permission.decorator";
import { ErrorCodes } from "@app/exceptions/enums/error-codes.enum";

@Controller("devices")
export class DevicesController {
  constructor(private devicesService: DevicesService) {}
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "signout-selected-session",
    type: SignoutForm,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.SignoutSelectSession)
  @Post("signout-selected-session")
  async signOutOneSession(
    @CurrentUser() user: User,
    @Body() body: SignoutForm,
  ) {
    const form = SignoutForm.from(body);
    const errors = await SignoutForm.validate(form);
    if (errors) throw new ApiRequestException(ErrorCodes.InvalidForm, errors);

    const deletedSession = await this.devicesService.signoutOneSession(
      user,
      body,
    );
    return DevicesDto.toEntity(deletedSession);
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "signout-sessions",
    type: SignoutForm,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.SignoutSessions)
  @Post("signout-sessions")
  async signOutSessions(@CurrentUser() user: User, @Body() body: SignoutForm) {
    const form = SignoutForm.from(body);
    const errors = await SignoutForm.validate(form);
    if (errors) throw new ApiRequestException(ErrorCodes.InvalidForm, errors);
    await this.devicesService.signoutSessions(user, body);
    return true;
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "signout-sessions",
    type: SignoutForm,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.GetUserDevices)
  @Get()
  async getUserDevices(@CurrentUser() user: User) {
    const devices = await this.devicesService.getUserDevices(user);
    return DevicesDto.toEntities(devices);
  }
}
