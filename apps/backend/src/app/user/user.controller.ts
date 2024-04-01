import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponse } from '@nestjs/swagger';
import { UpdateUserForm } from './domain/UpdateUser.form';
import { ErrorCodes } from '@app/exceptions/enums/error-codes.enum';
import { UserPermissions } from '@prisma/client';
import { UserDto } from './domain/user.dto';
import { ApiException } from "@app/exceptions/api-exception";
import { ApiRequestException } from "@app/exceptions/api-request-exception";
import { JwtAuthGuard } from "@app/security/guards/security.guard";
import { RequirePermissions } from "@app/security/decorators/permission.decorator";
import { PaginatedQueryDto } from './domain/paginatedQuery.dto';
import { CountingUserDto } from './domain/countinUsers.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) { }
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Successfully get all users',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.GetAllUsers)
  @Get()
  async getAllUsers(@Query() paginatedQuery: PaginatedQueryDto) {
    const users = await this.userService.getAllUsers(paginatedQuery);
    console.log(users)
    return CountingUserDto.toEntity(users);
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Successfully update user',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.UpdateUser)
  @Post()
  async updateUser(@Body() body: UpdateUserForm) {
    const form = UpdateUserForm.from(body);
    const errors = await UpdateUserForm.validate(form);
    if (errors) throw new ApiRequestException(ErrorCodes.InvalidForm, errors);

    const updatedUser = await this.userService.updateUser(form);
    return UserDto.toEntity(updatedUser);
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Successfully get single user',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.GetUserById)
  @Get('current/:id')
  async getOneUserById(@Param('id') id: string) {
    const user = await this.userService.getOneUserById({ id });
    if (!user) throw new ApiException(ErrorCodes.NoUser);
    return UserDto.toEntity(user);
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Successfully get user by search query',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.GetUsersBySearchQuery)
  @Get('search')
  async getUsersBySearchQuery(@Query('q') searchQuery: string) {
    const users = await this.userService.getUsersBySearchQuery(searchQuery);
    return UserDto.toEntities(users);
  }
}
