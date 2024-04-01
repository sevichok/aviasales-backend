import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  HttpCode,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { TicketService } from './ticket.service';
import { UpdateTicketCredsForm } from './domain/update-ticket-creds.form';
import { UpdateTicketStatusForm } from './domain/update-ticket-status.form';
import { ErrorCodes } from '@app/exceptions/enums/error-codes.enum';
import { User } from '.prisma/client';
import { TicketDto } from './domain/ticket.dto';
import { CreateTicketForm } from './domain/create-ticket.form';
import { UserPermissions } from '@prisma/client';
import { ApiException } from '@app/exceptions/api-exception';
import { ApiRequestException } from '@app/exceptions/api-request-exception';
import { RequirePermissions } from '@app/security/decorators/permission.decorator';
import { CurrentUser, JwtAuthGuard } from '@app/security/guards/security.guard';
import { PaginatedQueryDto } from './domain/paginatedQuery.dto';
import { CountingTicketsDto } from './domain/countingTickets.dto';

@Controller("ticket")
export class TicketController {
  constructor(private ticketService: TicketService) { }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "Successfully get all tickets",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.GetAllTickets)
  @Get()
  async getAllTickets(@Query() paginatedQuery: PaginatedQueryDto) {
    const tickets = await this.ticketService.getAllTickets(paginatedQuery);
    if (!tickets) throw new ApiException(ErrorCodes.NoTickets);
    return CountingTicketsDto.toEntity(tickets);
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "Successfully get active tickets",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.GetActiveTicketsByUserId)
  @Get("tickets/:id")
  async getActiveTicketsByUserId(@Param("id") id: string) {
    const tickets = await this.ticketService.getActiveTicketsByUserId({ id });
    if (!tickets) throw new ApiException(ErrorCodes.NoTicket);
    return TicketDto.toEntities(tickets);
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "Successfully delete ticket by id",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.DeleteTicketById)
  @Delete("/ordered/:id")
  async deleteOrderedTicketById(
    @CurrentUser() user: User,
    @Param("id") id: string,
  ) {
    return await this.ticketService.deleteOrderedTicketById(user, { id });
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "Successfully delete ticket by id",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.DeleteTicketById)
  @Delete(":id")
  async deleteTicketById(@CurrentUser() user: User, @Param("id") id: string) {
    return await this.ticketService.deleteTicketById(user, { id });
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "Successfully update ticket holder credentials",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiBody({ type: UpdateTicketCredsForm })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.UpdateTicketHolderCredentials)
  @Put("updateCreds")
  async updateTicketHolderCredsById(
    @CurrentUser() user: User,
    @Body() body: UpdateTicketCredsForm,
  ) {
    const form = UpdateTicketCredsForm.from(body);
    const errors = await UpdateTicketCredsForm.validate(form);
    if (errors) throw new ApiRequestException(ErrorCodes.InvalidForm, errors);

    const updatedTicket = await this.ticketService.updateTicketHolderCredsById(
      user,
      body,
    );
    if (!updatedTicket)
      throw new ApiException(ErrorCodes.UpdateTicketCredsError);
    return TicketDto.toEntity(updatedTicket);
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "Successfully update ticket status",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiBody({ type: UpdateTicketStatusForm })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.UpdateTicketStatus)
  @Put("updateStatus")
  async updateTicketStatusById(@Body() body: UpdateTicketStatusForm) {
    const form = UpdateTicketStatusForm.from(body);
    const errors = await UpdateTicketStatusForm.validate(form);
    if (errors) throw new ApiRequestException(ErrorCodes.InvalidForm, errors);

    const updatedTicket = await this.ticketService.updateTicketStatusById(body);
    if (!updatedTicket)
      throw new ApiException(ErrorCodes.UpdateTicketStatusError);
    return TicketDto.toEntity(updatedTicket);
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "Successfully created a new ticket",
    type: CreateTicketForm,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiBody({ type: CreateTicketForm })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.CreateNewTicket)
  @Post()
  async createTicket(
    @CurrentUser() user: User,
    @Body() body: CreateTicketForm,
  ) {
    const form = CreateTicketForm.from(body);
    const errors = await CreateTicketForm.validate(form);
    if (errors) throw new ApiRequestException(ErrorCodes.InvalidForm, errors);
    const picked_flight = await this.ticketService.getRelevantFlightsById(
      form.flights,
    );
    if (!picked_flight) {
      throw new ApiException(ErrorCodes.NoAvaliableSeats);
    }
    const ticket = await this.ticketService.createTicket(
      form,
      form.flights,
      user,
    );
    if (!ticket) throw new ApiException(ErrorCodes.CreateTicketError);
    return TicketDto.toEntities(ticket);
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "create order",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.UpdateTicketStatusToOrdered)
  @Post("ordered")
  async updateTicketsToOrdered(@CurrentUser() user: User) {
    const userTickets = await this.ticketService.getTicketsInCartByUserId(user);
    const decrementedFlights =
      await this.ticketService.decrementAvailableSeats(userTickets);
    if (!decrementedFlights) {
      throw new ApiException(ErrorCodes.Error);
    }
    const updatedTickets =
      await this.ticketService.updateTicketsStatus(userTickets);
    if (!updatedTickets) {
      throw new ApiException(ErrorCodes.Error);
    }
    return TicketDto.toEntities(userTickets);
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "get tickets in cart by user id",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.GetTicketsInCartByUserId)
  @Get("cart")
  async getTicketsInCartByUserId(@CurrentUser() user: User) {
    const tickets = await this.ticketService.getTicketsInCartByUserId(user);
    return TicketDto.toEntities(tickets);
  }
}
