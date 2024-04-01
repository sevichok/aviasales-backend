import { Test, TestingModule } from '@nestjs/testing';
import { jest, expect } from '@jest/globals';
import { JwtAuthGuard } from '@app/libs/security/src/guards/security.guard';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ApiException } from '@app/exceptions/api-exception';
import { ApiRequestException } from '@app/exceptions/api-request-exception';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenDto } from './domain/Token.dto';
import { SecurityService } from '@app/libs/security/src';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SignInForm } from './domain/SignIn.form';
import { UserRoles } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService
  let securityService: SecurityService

  const mockPermissionGuard = {
  }
  const user = {
    id: '7bfe13fd-2d0c-467c-82a4-c31fb34d6452',
    first_name: 'asd',
    last_name: 'asd',
    role_id: '61a9c74c-eda3-4f4d-8037-e35ad4d2e7c9',
    role_type: UserRoles.Client,
    email: 'admi123n@admin.com',
    password: '$2a$05$5htSIabJmdX86Rj5lqto8e3/w0HJAowRcnpTGovPkkqm1R5a4SJ6i',
    tickets: []
  }
  const tokens: TokenDto = {
    access_token: 'access-token',
    refresh_token: 'refresh-token'
  }
  const signUpDto = {
    device_id: "ee7c493a-31d9-48c0-8838-1f466eab180a",
    email: "admi123n@admin.com",
    password: "admiASDASD!@#1231n",
    first_name: 'name',
    last_name: 'name'
  }
  const signInDto = {
    device_id: "ee7c493a-31d9-48c0-8838-1f466eab180a",
    email: "admi123n@admin.com",
    password: "admiASDASD!@#1231n",
  }
  const signInAdminDto = {
    device_id: "ee7c493a-31d9-48c0-8838-1f466eab180a",
    email: "admin@admin.com",
    password: "admiASDASD!@#1231n",
  }
  const forgot_password = {
    device_id: "ee7c493a-31d9-48c0-8838-1f466eab180a",
    email: "admin@admin.com",
  }
  const reset_password = {
    email: "admin@admin.com",
    device_id: "ee7c493a-31d9-48c0-8838-1f466eab180a",
    password: "admiASDASD!@#1231n",
    password_confirm: "admiASDASD!@#1231n",
    reset_token: 'ee7c493a-31d9-48c0-8838-1f466eab180a'
  }
  const decoded_user = {
    id: "ee7c493a-31d9-48c0-8838-1f466eab180a",
    email: "admin@admin.com",
    role_id: "ee7c493a-31d9-48c0-8838-1f466eab180a",
    device_id: "ee7c493a-31d9-48c0-8838-1f466eab180a"
  }
  const mockAuthService = {
    getUserByEmail: jest.fn((email: string) => {
      console.log(email)
      if (email == 'wrong@email.com') {
        return null
      }
      return user
    }),

    getAdminByEmail: jest.fn((email: string) => {
      if (email === 'wrongAdmin@email.com') {
        return null
      }
      return user
    }),
    comparePassword: jest.fn((password_1: string, password_2: string) => {
      if (password_1 !== password_2) {
        return false
      }
      return true
    }),

    findSessionByEmail: jest.fn((data: { email: string, device_id: string }) => {
      if (data.email === 'wrong@email.com') {
        return null
      }
      return user
    }),

    findSessionByResetToken: jest.fn((data: { reset_token: string }) => {
      if (data.reset_token === 'ee7c493a-31d9-48c0-8838-1f466eab181a') {
        return null
      }
      return user
    }),

    changePassword: jest.fn(() => {
      return user
    }),
    deleteResetToken: jest.fn(() => {
      return user
    }),
    authenticate: jest.fn(() => {
      return tokens
    }),
    setResetToken: jest.fn(() => {
      return 'string'
    }),
    signout: jest.fn((id: string) => {
      if (id === 'wrong user id') {
        return null
      }
      return 'string'
    }),




    // updateUser: jest.fn((data: { id: string }) => {
    //   if (data.id == '7bfe13fd-2d0c-467c-82a4-c31fb34d6411') {
    //     throw new ApiException(ErrorCodes.UpdateUserError);
    //   } else {
    //     return user
    //   }
    // }),

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
      controllers: [AuthController],
      providers: [AuthService,
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
    }).overrideProvider(AuthService).useValue(mockAuthService)
      .overrideProvider(SecurityService).useValue(mockSecurityService)

      .overrideGuard(JwtAuthGuard).useValue(mockPermissionGuard)

      .compile();

    service = module.get<AuthService>(AuthService);
    controller = module.get<AuthController>(AuthController);
    securityService = module.get<SecurityService>(SecurityService);

  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  describe('sign In', () => {

    it('wrong form', async () => {
      const invalidDTO: SignInForm | any = {
        ...signInDto,
        email: 'not email'
      }
      try {
        await controller.signIn(invalidDTO);
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError);
      }
    });
    it('should get user by email', async () => {
      // Arrange
      const email = "email@email.com"
      // Actq
      const result = await mockAuthService.getUserByEmail(email);
      expect(result).toEqual(user);
    });
    it('should return null with wrong email', async () => {
      // Arrange
      const email = "wrong@email.com"
      // Actq
      const result = await mockAuthService.getUserByEmail(email);
      expect(result).toBeNull();
    });
    it('should return true if password are compare', async () => {
      // Arrange
      const password_1 = "password"
      const password_2 = "password"

      // Actq
      const result = await mockAuthService.comparePassword(password_1, password_2);
      expect(result).toBeTruthy();
    });

    it('should return false if password are not compare', async () => {
      // Arrange
      const password_1 = "not-password"
      const password_2 = "password"

      // Actq
      const result = await mockAuthService.comparePassword(password_1, password_2);
      expect(result).toBeFalsy();
    });

    it('should throw ApiRequestException', async () => {
      // Arrange
      const invalidUserId = { ...signInDto, email: 'not email' };
      // Mock I18nContext
      let i18n: any = {
        t: (key: string) => {
          return key;
        },
      };
      jest.spyOn(I18nContext, 'current').mockReturnValue(i18n);
      await expect(controller.signIn(invalidUserId)).rejects.toThrow(ApiRequestException);
    });

    it('should throw ApiException no-user', async () => {
      const invalidUserEmail = { ...signInDto, email: 'wrong@email.com' };
      let i18n: any = {
        t: (key: string) => {
          return key;
        },
      };
      jest.spyOn(service, 'getUserByEmail').mockResolvedValueOnce(null);
      jest.spyOn(securityService, 'refresh').mockResolvedValueOnce({ ...tokens });
      jest.spyOn(I18nContext, 'current').mockReturnValue(i18n);
      await expect(controller.signIn(invalidUserEmail)).rejects.toThrow(ApiException);
    });

    it('should throw ApiException wrong-password', async () => {
      const invalidUserPassword = { ...signInDto, password: 'INVAlid-password123**' };
      let i18n: any = {
        t: (key: string) => {
          return key;
        },
      };
      jest.spyOn(service, 'comparePassword').mockResolvedValueOnce(false);
      jest.spyOn(I18nContext, 'current').mockReturnValue(i18n);
      await expect(controller.signIn(invalidUserPassword)).rejects.toThrow(ApiException);
    });
  });


  describe('sign In for admin', () => {
    it('wrong form', async () => {
      const invalidDTO: SignInForm | any = {
        ...signInDto,
        email: 'not email'
      }
      try {
        await controller.signIn(invalidDTO);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiRequestException);
      }
    });
    it('should throw ApiRequestException', async () => {
      const invalidUserId = { ...signInAdminDto, email: 'not email' };
      let i18n: any = {
        t: (key: string) => {
          return key;
        },
      };
      jest.spyOn(I18nContext, 'current').mockReturnValue(i18n);
      await expect(controller.adminSignin(invalidUserId)).rejects.toThrow(ApiRequestException);
    });
    it('should get admin by email', async () => {
      // Arrange
      const email = "email@email.com"
      // Actq
      const result = await mockAuthService.getUserByEmail(email);
      expect(result).toEqual(user);
    });

    it('should throw ApiException no-admin', async () => {
      const invalidAdminEmail = { ...signInAdminDto, email: 'wrongAdmin@email.com' };
      let i18n: any = {
        t: (key: string) => {
          return key;
        },
      };
      jest.spyOn(service, 'getAdminByEmail').mockResolvedValueOnce(null);
      jest.spyOn(I18nContext, 'current').mockReturnValue(i18n);
      expect(controller.adminSignin(invalidAdminEmail)).rejects.toThrow(ApiException);
    });

    it('should throw ApiException wrong-password', async () => {
      const invalidUserPassword = { ...signInAdminDto, password: 'INVAlid-password123**' };
      let i18n: any = {
        t: (key: string) => {
          return key;
        },
      };
      jest.spyOn(service, 'comparePassword').mockResolvedValueOnce(false);
      jest.spyOn(I18nContext, 'current').mockReturnValue(i18n);
      await expect(controller.adminSignin(invalidUserPassword)).rejects.toThrow(ApiException);
    });
  })


  describe('sign up for users', () => {
    it('should throw ApiRequestException', async () => {
      const invalidUserEmail = { ...signUpDto, email: 'not email' };
      let i18n: any = {
        t: (key: string) => {
          return key;
        },
      };
      jest.spyOn(I18nContext, 'current').mockReturnValue(i18n);
      await expect(controller.signUp(invalidUserEmail)).rejects.toThrow(ApiRequestException);
    });

    it('should throw ApiException no-admin', async () => {
      const invalidAdminEmail = { ...signUpDto, email: 'admin@admin.com' };
      let i18n: any = {
        t: (key: string) => {
          return key;
        },
      };
      jest.spyOn(service, 'getUserByEmail').mockResolvedValueOnce(user);
      jest.spyOn(I18nContext, 'current').mockReturnValue(i18n);
      await expect(controller.signUp(invalidAdminEmail)).rejects.toThrow(ApiException);
    });
    it('should throw ApiException no-admin', async () => {
      const invalidAdminEmail = { ...signUpDto, email: 'admin@admin.com' };
      let i18n: any = {
        t: (key: string) => {
          return key;
        },
      };
      jest.spyOn(service, 'getUserByEmail').mockResolvedValueOnce(user);
      jest.spyOn(I18nContext, 'current').mockReturnValue(i18n);
      await expect(controller.signUp(invalidAdminEmail)).rejects.toThrow(ApiException);
    });
  })


  describe('sign out', () => {
    it('should throw ApiRequestException', async () => {
      const invalidForm = { device_id: 'not uuid' };
      let i18n: any = {
        t: (key: string) => {
          return key;
        },
      };
      jest.spyOn(I18nContext, 'current').mockReturnValue(i18n);
      await expect(controller.signOut(user, invalidForm)).rejects.toThrow(ApiRequestException);
    });
  })

  describe('forgot-password', () => {
    it('should throw ApiRequestException', async () => {
      const invalidUserEmail = { ...forgot_password, email: 'not email' };
      let i18n: any = {
        t: (key: string) => {
          return key;
        },
      };
      jest.spyOn(I18nContext, 'current').mockReturnValue(i18n);
      await expect(controller.forgotPassword(invalidUserEmail)).rejects.toThrow(ApiRequestException);
    });

    it('should throw ApiException no session', async () => {
      const invalidSession = { ...forgot_password, email: 'wrong@email.com' };
      let i18n: any = {
        t: (key: string) => {
          return key;
        },
      };
      jest.spyOn(I18nContext, 'current').mockReturnValue(i18n);
      await expect(controller.forgotPassword(invalidSession)).rejects.toThrow(ApiException);
    });
  })


  describe('reset-password', () => {
    it('should throw ApiRequestException', async () => {
      const invalidSession = { ...reset_password, reset_token: 'invalid token' };
      let i18n: any = {
        t: (key: string) => {
          return key;
        },
      };
      jest.spyOn(I18nContext, 'current').mockReturnValue(i18n);
      await expect(controller.resetPassword(invalidSession)).rejects.toThrow(ApiRequestException);
    });
    it('should throw ApiException no session', async () => {
      const invalidSession = { ...reset_password, reset_token: 'ee7c493a-31d9-48c0-8838-1f466eab181a' };
      let i18n: any = {
        t: (key: string) => {
          return key;
        },
      };
      jest.spyOn(service, 'findSessionByResetToken').mockResolvedValueOnce(null);
      jest.spyOn(I18nContext, 'current').mockReturnValue(i18n);
      await expect(controller.resetPassword(invalidSession)).rejects.toThrow(ApiException);
    });
  })

  describe('refresh', () => {
    it('should throw ApiException no-user', async () => {
      const invalidUserEmail = { ...decoded_user, email: 'wrong123@email.com' };
      let i18n: any = {
        t: (key: string) => {
          return key;
        },
      };
      jest.spyOn(service, 'getUserByEmail').mockResolvedValueOnce(null);
      jest.spyOn(I18nContext, 'current').mockReturnValue(i18n);
      await expect(controller.refresh(invalidUserEmail)).rejects.toThrow(ApiException);
    });
  })
})