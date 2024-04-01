import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { FlightsService } from "./flights.service";
import { ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "@app/security/guards/security.guard";
import { RequirePermissions } from "@app/security/decorators/permission.decorator";
import { UserPermissions } from "@prisma/client";
import { ApiException } from "@app/exceptions/api-exception";
import { ErrorCodes } from "@app/exceptions/enums/error-codes.enum";
import { FlightsSorted } from "@/backend/app/flights/enum/flights-sortedBy.enum";
import { PathsDto } from "@/backend/app/flights/domain/paths.dto";
import { ChangeFlightStatus } from "@/backend/app/flights/domain/ChangeFlightStatus.form";
import { ApiRequestException } from "@app/exceptions/api-request-exception";
import { FlightDto } from "@/backend/app/flights/domain/flight.dto";
import { ChangeFlightPrice } from "@/backend/app/flights/domain/ChangeFlightPrice.form";

@Controller("flights")
export class FlightsController {
  constructor(private flightService: FlightsService) {}

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "Successfully get array of paths",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.GetArrayOfPath)
  @Get()
  async getArrayOfPath(
    @Query("from_city") from_city: string,
    @Query("to_city") to_city: string,
    @Query("date") date_string: string,
    @Query("isReturn") isReturn: boolean,
    @Query("returnDate") returnDate: string,
    @Query("sortedBy") sortedBy: string,
  ) {
    const start_flight_date = new Date(date_string);
    const return_flight_date = new Date(returnDate);
    const from_city_entity = await this.flightService.getCityByTitle({
      title: from_city,
    });
    const to_city_entity = await this.flightService.getCityByTitle({
      title: to_city,
    });
    if (!from_city_entity || !to_city_entity) {
      throw new ApiException(ErrorCodes.NoCity);
    }
    const flights = await this.flightService.getAllFlights({
      start_flight_date,
      from_city_id: from_city_entity.id,
    });
    if (!flights) {
      throw new ApiException(ErrorCodes.NoFlights);
    }
    const graph = await this.flightService.convertToGraph(flights);
    const path = await this.flightService.findAllPaths(
      graph,
      from_city_entity,
      to_city_entity,
      { start_flight_date },
      isReturn,
      { start_flight_date: return_flight_date },
    );

    if (!path.length) {
      throw new ApiException(ErrorCodes.NoPath);
    }
    if (sortedBy === FlightsSorted.Time) {
      const sortedPathByTime = this.flightService.sortArraysByTotalTime(path);
      return PathsDto.toEntities(sortedPathByTime);
    }
    const sortedPathByPrice = this.flightService.sortArraysByTotalPrice(path);
    return PathsDto.toEntities(sortedPathByPrice);
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "Successfully change flight status",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.ChangeFlightStatus)
  @Post("status")
  async changeFlightStatus(@Body() body: ChangeFlightStatus) {
    const form = ChangeFlightStatus.from(body);
    const errors = ChangeFlightStatus.validate(form);
    if (errors) throw new ApiRequestException(ErrorCodes.InvalidForm, errors);

    const updatedFlight = await this.flightService.changeFlightStatus(form);
    return FlightDto.toEntity(updatedFlight);
  }

  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "Successfully change flight price",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(UserPermissions.ChangeFlightPrice)
  @Post("price")
  async changeFlightPrice(@Body() body: ChangeFlightPrice) {
    const form = ChangeFlightPrice.from(body);
    const errors = ChangeFlightPrice.validate(form);
    if (errors) throw new ApiRequestException(ErrorCodes.InvalidForm, errors);

    const updatedFlight = await this.flightService.changeFlightPrice(form);
    return FlightDto.toEntity(updatedFlight);
  }
}
