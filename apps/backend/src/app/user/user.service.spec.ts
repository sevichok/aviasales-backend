import { Test, TestingModule } from '@nestjs/testing';

// ============ Entities ================
import { UserService } from './user.service';
import { UserDto } from './domain/user.dto';
import { CityDto } from './domain/city.dto';
import {JwtAuthGuard} from "@app/security/guards/security.guard";
import {UsersReposService} from "@/backend/domain/repos/user-repos.service";
describe('CartService', () => {
    let service: UserService;
    let repo: UsersReposService;
    let i18n: any = {
        t: () => jest.fn().mockResolvedValue(true),
      };
    const user: UserDto = {
        id: "test",
        email: "test",
        first_name: 'string',
        last_name: 'string',
        tickets: []
    }
    const city: CityDto = {
        id: 'id',
        title: 'title'
    }
    const mockUserRepo = {
        getAllUsers: jest.fn().mockResolvedValue([user]),
        getOneUserById: jest.fn().mockResolvedValue(user),
        updateUser: jest.fn().mockResolvedValue(user),
        getUsersBySearchQuery: jest.fn().mockResolvedValue([user]),



        
    }

    const mockPermissionGuard = {}

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UserService, UsersReposService],
        })
            .overrideProvider(UsersReposService).useValue(mockUserRepo)
            .overrideGuard(JwtAuthGuard).useValue(mockPermissionGuard)
            .compile();

        service = module.get<UserService>(UserService);
        repo = module.get<UsersReposService>(UsersReposService)
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    
    describe('should return users', () => {
        it('should return carts', async () => {
            repo.getAllUsers = jest.fn().mockResolvedValue([user])
            expect(await service.getAllUsers({pageNumber: 1, pageSize: 10})).toEqual([user])
        })

        it('should return user by id', async () => {
            repo.getOneUserById = jest.fn().mockResolvedValue(user)
            expect(await service.getOneUserById({ id: '2bd5bf42-b8e3-429f-93ae-af963700825f' })).toEqual(user)
        })

        it('should update user', async () => {
            repo.updateUser = jest.fn().mockResolvedValue(user)
            expect(await service.updateUser(user)).toEqual(user)
        })

        it('should get Users By Search Queryt', async () => {
            repo.getUsersBySearchQuery = jest.fn().mockResolvedValue([user])
            expect(await service.getUsersBySearchQuery('v')).toEqual([user])
        })
        it('should get Users By Search Queryt', async () => {
            repo.getUsersBySearchQuery = jest.fn().mockResolvedValue([user])
            expect(await service.getUsersBySearchQuery('v')).toEqual([user])
        })
    })


})