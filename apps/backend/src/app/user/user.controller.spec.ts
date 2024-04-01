import { Test, TestingModule } from "@nestjs/testing";
import { jest, expect } from "@jest/globals";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserDto } from "./domain/user.dto";
import { I18nContext, I18nService } from "nestjs-i18n";
import { ApiException } from "@app/exceptions/api-exception";
import { ApiRequestException } from "@app/exceptions/api-request-exception";
import { ErrorCodes } from "@app/exceptions/enums/error-codes.enum";
import { JwtAuthGuard } from "@app/security/guards/security.guard";

describe("AuthController", () => {
  let controller: UserController;
  let service: UserService;

  const mockPermissionGuard = {};

  const user: UserDto = {
    id: "7bfe13fd-2d0c-467c-82a4-c31fb34d6452",
    first_name: "asd",
    last_name: "asd",
    email: "admi123n@admin.com",
    tickets: [],
  };
  const mockUserService = {
    getAllUsers: jest.fn(() => {
      return [user];
    }),

    getOneUserById: jest.fn((data: { id: string }) => {
      if (data.id == "wrong id") {
        return null;
      } else {
        return user;
      }
    }),

    getUsersBySearchQuery: jest.fn((q: string) => {
      return [user];
    }),
    updateUser: jest.fn((data: { id: string }) => {
      if (data.id == "7bfe13fd-2d0c-467c-82a4-c31fb34d6411") {
        throw new ApiException(ErrorCodes.UpdateUserError);
      } else {
        return user;
      }
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: I18nService,
          useValue: { t: jest.fn(() => "some value") },
        },
      ],
    })
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockPermissionGuard)

      .compile();

    service = module.get<UserService>(UserService);
    controller = module.get<UserController>(UserController);
  });
  it("should be defined", () => {
    expect(service).toBeDefined();
  });
  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
  describe("getAllUsers", () => {
    it("should be defined", () => {
      expect(controller).toBeDefined();
    });
    it("should return an array of users", async () => {
      expect(await controller.getAllUsers({pageNumber: 1, pageSize: 10})).toEqual([user]);
    });
  });

  describe("getOneUserById", () => {
    it("should get user by id", async () => {
      // Arrange
      const userId = "7bfe13fd-2d0c-467c-82a4-c31fb34d6452";

      // Act
      const result = await controller.getOneUserById(userId);

      // Assert
      expect(result).toEqual(user);
    });

    it("should throw ApiException", async () => {
      // Arrange
      const invalidUserId = "wrong id";
      // Mock I18nContext
      let i18n: any = {
        t: (key: string) => {
          return key;
        },
      };
      jest.spyOn(I18nContext, "current").mockReturnValue(i18n);
      await expect(controller.getOneUserById(invalidUserId)).rejects.toThrow(
        ApiException,
      );
    });

    // Add more tests for other scenarios if needed
  });

  describe("getUsersBySearchQuery", () => {
    it("should return an user by search query", async () => {
      expect(await controller.getUsersBySearchQuery("asd")).toEqual([user]);
    });
  });

  describe("updateUser", () => {
    it("a", async () => {
      expect(await controller.updateUser(user)).toEqual(user);
    });
    it("wrong search query", async () => {
      const invalidDTO: UserDto | any = {
        ...user,
        email: "not email",
      };
      try {
        await controller.updateUser(invalidDTO);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiRequestException);
      }
    });

    it("should throw ApiException with ErrorCodes.NoUser if userService returns null", async () => {
      // Arrange
      const invalidUserId = {
        id: "7bfe13fd-2d0c-467c-82a4-c31fb34d6411",
        first_name: "asd",
        last_name: "asd",
        email: "admi123n@admin.com",
        tickets: [],
      };

      // Mock I18nContext
      let i18n: any = {
        t: (key: string) => {
          return key;
        },
      };
      jest.spyOn(I18nContext, "current").mockReturnValue(i18n);
      // Act and Assert
      await expect(controller.updateUser(invalidUserId)).rejects.toThrow(
        ApiException,
      );
    });
  });
});
