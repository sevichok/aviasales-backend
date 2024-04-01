import { Test, TestingModule } from '@nestjs/testing';
import { jest, expect } from '@jest/globals';
import { JwtAuthGuard } from '@app/libs/security/src/guards/security.guard';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ApiException } from '@app/exceptions/api-exception';
import { ApiRequestException } from '@app/exceptions/api-request-exception';
import { SecurityService } from '@app/libs/security/src';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserRoles } from '@prisma/client';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';

describe('FlightsController', () => {
  let controller: FlightsController;
  let service: FlightsService
  let securityService: SecurityService

  const mockPermissionGuard = {
  }
  const city = {
    id: '',
    title: 'Minsk'
  }
  const date_string = 'date'
  const isReturn = false
  const returnDate = 'return date'
  const sortedBy = 'Price'
  const mockFlightsService = {
    getCityByTitle: jest.fn((title: string) => {
      if (title == 'wrong') {
        return null
      }
      return city
    }),
  }

  const mockSecurityService = {
    refresh: jest.fn((data) => {
      if (!data) {
        return null
      }
      return {
        access_token: 'token',
        refresh_token: 'token'
      }
    }),
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlightsController],
      providers: [FlightsService,
        {
          provide: I18nService,
          useValue: { t: jest.fn(() => 'some value') },
        },
        JwtAuthGuard, SecurityService
      ],
      imports: [
        ConfigModule.forRoot(),
        JwtModule.register({ secretOrPrivateKey: "SECRET" })
      ]
    }).overrideProvider(FlightsService).useValue(mockFlightsService)
      .overrideProvider(SecurityService).useValue(mockSecurityService)

      .overrideGuard(JwtAuthGuard).useValue(mockPermissionGuard)

      .compile();

    service = module.get<FlightsService>(FlightsService);
    controller = module.get<FlightsController>(FlightsController);
    securityService = module.get<SecurityService>(SecurityService);

  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  describe('Flights', () => {

    it('should get user by email', async () => {
      // Arrange
      const title = "Minsk"
      // Actq
      const result = await mockFlightsService.getCityByTitle(title);
      expect(result).toEqual(city);
    });
    it('should return null with wrong email', async () => {
      // Arrange
      const title = "wrong"
      // Actq
      const result = await mockFlightsService.getCityByTitle(title);
      expect(result).toBeNull();
    });
  });



})