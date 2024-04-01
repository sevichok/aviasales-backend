import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SecurityService } from "@app/security";
import { ApiBody, ApiResponse } from "@nestjs/swagger";
import { ApiRequestException } from "@app/exceptions/api-request-exception";
import { ErrorCodes } from "@app/exceptions/enums/error-codes.enum";
import { ApiException } from "@app/exceptions/api-exception";
import { CurrentUser, JwtAuthGuard } from "@app/security/guards/security.guard";
import { RequirePermissions } from "@app/security/decorators/permission.decorator";
import { User, UserPermissions } from "@prisma/client";
import { TokenDto } from "@/backend/app/auth/domain/Token.dto";
import { SignInForm } from "@/backend/app/auth/domain/SignIn.form";
import { SignUpForm } from "@/backend/app/auth/domain/SignUp.form";
import { SignoutForm } from "@/backend/app/auth/domain/Signout.form";
import { ResetTokenDto } from "@/backend/app/auth/domain/ResetToken.dto";
import { ForgotPasswordForm } from "@/backend/app/auth/domain/ForgotPassword.form";
import { ResetPasswordForm } from "@/backend/app/auth/domain/ResetPassword.form";
import { decoded_user } from "@/backend/types/decoded-user.type";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private securityService: SecurityService,
  ) {}
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "Successfully login",
    type: TokenDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiBody({ type: SignInForm })
  @Post("signin")
  async signIn(@Body() body: SignInForm) {
    const form = SignInForm.from(body);
    const errors = await SignInForm.validate(form);
    if (errors) throw new ApiRequestException(ErrorCodes.InvalidForm, errors);

    const user = await this.authService.getUserByEmail(form);
    if (!user) throw new ApiException(ErrorCodes.NotExists_User);

    const isCompare = await this.authService.comparePassword(user, form);
    if (!isCompare) throw new ApiException(ErrorCodes.InvalidPassword);

    const tokens = await this.authService.authenticate(user, form);

    return TokenDto.toEntity(tokens);
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "Successfully admin login",
    type: TokenDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiBody({ type: SignInForm })
  @Post("admin/signin")
  async adminSignin(@Body() body: SignInForm) {
    const form = SignInForm.from(body);
    const errors = await SignInForm.validate(form);
    if (errors) throw new ApiRequestException(ErrorCodes.InvalidForm, errors);

    const admin = await this.authService.getAdminByEmail(form);
    if (!admin) throw new ApiException(ErrorCodes.NotExists_User);

    const isCompare = await this.authService.comparePassword(admin, form);
    if (!isCompare) throw new ApiException(ErrorCodes.InvalidPassword);

    const tokens = await this.authService.authenticate(admin, form);

    return TokenDto.toEntity(tokens);
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "Successfully created a new user",
    type: TokenDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiBody({ type: SignUpForm })
  @Post("signup")
  async signUp(@Body() body: SignUpForm) {
    const form = SignUpForm.from(body);
    const errors = await SignUpForm.validate(form);
    if (errors) throw new ApiRequestException(ErrorCodes.InvalidForm, errors);

    const candidate = await this.authService.getUserByEmail(form);
    if (candidate) {
      throw new ApiException(ErrorCodes.AlreadyRegistered);
    }

    const user = await this.authService.signUp(form);
    const tokens = await this.authService.generateTokens(user, form);
    return TokenDto.toEntity(tokens);
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "Successfully signout",
    type: Boolean,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.Signout)
  @Post("signout")
  async signOut(@CurrentUser() user: User, @Body() body: SignoutForm) {
    const form = SignoutForm.from(body);
    const errors = await SignoutForm.validate(form);
    if (errors) throw new ApiRequestException(ErrorCodes.InvalidForm, errors);

    const isSuccess = await this.authService.signout(user, form);
    return true;
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "password changed",
    type: ResetTokenDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @Post("forgot-password")
  async forgotPassword(@Body() body: ForgotPasswordForm) {
    const form = ForgotPasswordForm.from(body);
    const errors = await ForgotPasswordForm.validate(form);
    if (errors) throw new ApiRequestException(ErrorCodes.InvalidForm, errors);

    const session = await this.authService.findSessionByEmail(form);
    if (!session) {
      throw new ApiException(ErrorCodes.NotExists_User);
    }

    const token = await this.authService.setResetToken(session, form);
    return ResetTokenDto.toEntity({ token });
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "reset password",
    type: TokenDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @Post("reset-password")
  async resetPassword(@Body() body: ResetPasswordForm) {
    const form = ResetPasswordForm.from(body);
    const errors = await ResetPasswordForm.validate(form);
    if (errors) throw new ApiRequestException(ErrorCodes.InvalidForm, errors);

    const entity = await this.authService.findSessionByResetToken(form);
    if (!entity) throw new ApiException(ErrorCodes.Error);

    const user = await this.authService.changePassword(entity.user, form);
    await this.authService.deleteResetToken(user, form);
    const tokens = await this.authService.authenticate(user, form);
    return TokenDto.toEntity(tokens);
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "refresh",
    type: TokenDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.RefreshToken)
  @Get("refresh")
  async refresh(@CurrentUser() user: decoded_user) {
    const user_entity = await this.authService.getUserByEmail(user);
    if (!user_entity) {
      throw new ApiException(ErrorCodes.NotExists_User);
    }
    const tokens = await this.securityService.refresh(user_entity, user);
    return TokenDto.toEntity(tokens);
  }
}
