import { ExecutionContext, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ChatGateway } from "./chat.gateway";
import { Socket, io } from "socket.io-client";
import { jest } from "@jest/globals";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { v4 } from "uuid";
import { RequestDto } from "@app/types/request.dto";
import { Server } from "socket.io";
import { SecurityService } from "@app/security";
import {User, UserRoles} from "@prisma/client";
import {RedisService} from "@app/redis";
import {user_id} from "@/backend/types/user-id.type";
import {JwtAuthGuard} from "@app/security/guards/security.guard";
import {UserSessionDto} from "@app/security/dtos/UserSessionDto";
import {MessageDto} from "@app/types/message.dto";

const mockRoomId = v4();
const mockMessage = "Hello";
const mockServer: Server = new Server();
const mockUser = {
  id: "7bfe13fd-2d0c-467c-82a4-c31fb34d6452",
  first_name: "asd",
  last_name: "asd",
  role_id: "61a9c74c-eda3-4f4d-8037-e35ad4d2e7c9",
  role_type: UserRoles.Client,
  email: "client@client.com",
  password: "$2a$05$5htSIabJmdX86Rj5lqto8e3/w0HJAowRcnpTGovPkkqm1R5a4SJ6i",
  tickets: [],
  device_id: "068b0a86-f711-4d8d-9977-94e5e7aa9777"
};
const mockRequestDto: RequestDto = RequestDto.toEntity(mockUser);
const mockRoomDto = {
  room_id: mockUser.id
}

async function eventReception(from: Socket, event: string): Promise<void> {
  return new Promise<void>((resolve) => {
    from.on(event, () => {
      resolve();
    });
  });
}

async function createNestApp(...gateways: any): Promise<INestApplication> {
  const testingModule = await Test.createTestingModule({
    providers: gateways,
  }).compile();
  return testingModule.createNestApplication();
}

describe("ChatGateway", () => {
  // let gateway: ChatGateway;
  // let app: INestApplication;
  // let ioClient: Socket;

  let gateway: ChatGateway;
  let redisService: RedisService;
  let redisServiceSpy;
  let securityService: SecurityService;

  let managerClient: Socket;
  let customerClient: Socket;

  let redisManagerClient;

  let app: INestApplication;

  const mockPermissionGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      console.log("in mocked guard");
      const client = context.switchToWs().getClient();
      client.data.user = mockUser;
      console.log(client.data);
      return true;
    }),
  };
  const mockSecurityService = {
    getUserById: jest.fn(({ id }: user_id) => {
      console.log("id", id);
      console.log("mock user id", mockUser.id);
      if (id === mockUser.id) {
        return mockUser;
      }
      return null;
    }),
  };

  const mockRedisService = {
    addRoom: jest.fn((dto: RequestDto) => dto.id === mockUser.id),
    isRoomInStore: jest.fn((roomId: string) => roomId === mockUser.id),
    saveMessage: jest.fn((message: MessageDto) => {
    }),
    getAllMessages: jest.fn((roomId: string) => {

    }),
    getRooms: jest.fn(() => {

    })
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [
        RedisService,
        SecurityService,
        ChatGateway,
      ],
      imports: [
        ConfigModule.forRoot(),
        JwtModule.register({ secretOrPrivateKey: "SECRET" }),
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockPermissionGuard)
      .overrideProvider(SecurityService)
      .useValue(mockSecurityService)
      .overrideProvider(RedisService)
      .useValue(mockRedisService)
      .compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    redisService = module.get<RedisService>(RedisService);
    securityService = module.get<SecurityService>(SecurityService);

    app = module.createNestApplication();

    // Instantiate the app
    // app = await createNestApp(ChatGateway);
    // // Get the gateway instance from the app instance
    // gateway = app.get<ChatGateway>(ChatGateway);
    // // Create a new client that will interact with the gateway
    managerClient = io("http://localhost:6000", {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
    customerClient = io("http://localhost:6000", {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });

    // app = module.createNestApplication();
    //
    await app.listen(6000);
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });

  it("user should send request on first connect", async () => {
    customerClient.connect();

    const userDto = UserSessionDto.fromPayload(mockUser);
    const user = mockSecurityService.getUserById(userDto);

    expect(user).toEqual(mockUser);

    customerClient.emit("join-room", {room_id: user.id});
    const room = mockRedisService.isRoomInStore(user.id);


    customerClient.on("join-room", (data) => {
      expect(data).toMatchObject(mockRoomDto);
    })
  })

  it("customer should join a room and send a request", async () => {
    customerClient.connect();
    // console.log(customerClient);

    customerClient.emit("join-chat", mockRoomId);
    await new Promise<void>((resolve) => {
      customerClient.on("connect", () => {
        console.log("connected");
      });

      customerClient.on("join-chat", (data) => {
        expect(data).toEqual(mockRoomId);
        console.log("joined chat");
        resolve();
      });
    });

    customerClient.disconnect();
    // customerClient.on("join-chat", (data) => {
    //     expect(data).toEqual(mockRoomId);
    // })
    //

    //
    // await eventReception(customerClient, "join-chat");

    // const userDto = UserSessionDto.fromPayload(mockUser);
    // const user = mockSecurityService.getUserById(userDto.id);
    // expect(user).toEqual(mockUser);
    // const requestDto = RequestDto.toEntity(user);

    // короче забить на редис, просто проверить все методы с гейтвея, также в гейтвее обработать исключения
    // отдельно протестировать редис сервис
    expect(redisServiceSpy.onRequest).toBeCalledWith(mockRequestDto);
    expect(redisServiceSpy.subToMessage).toBeCalledWith(
      mockRoomId,
      mockServer,
      customerClient,
    );
    //
    // managerClient.on("message", (data) => {
    //     expect(data).toEqual(mockRequestDto);
    // });
    // customerClient.on("disconnect", () => done());
    // customerClient.close();
    // done();
  }, 30000);

  // it('should emit "pong" on "ping"', async () => {
  //     ioClient.connect();
  //     ioClient.emit("ping", "Hello world!");
  //     await new Promise<void>((resolve) => {
  //         ioClient.on("connect", () => {
  //             console.log("connected");
  //         });
  //         ioClient.on("pong", (data) => {
  //             expect(data).toBe("Hello world!");
  //             resolve();
  //         });
  //     });
  //     ioClient.disconnect();
  // });
});