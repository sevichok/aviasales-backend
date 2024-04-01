import { PrismaClient, UserPermissions, UserRoles } from "@prisma/client";
import { mockCityData } from "./mock-city-data";
import { mockPlaneData } from "./mock-plane-data";
import { mock } from "./mock-flight-data";

const prisma = new PrismaClient();

async function main() {
  const Client = await prisma.role.create({
    data: {
      type: UserRoles.Client,
      permissions: [
          UserPermissions.Signout,
          UserPermissions.PasswordChange,
          UserPermissions.RefreshToken,
          UserPermissions.GetUserById,
          UserPermissions.UpdateUser,
          UserPermissions.GetAllCities,
          UserPermissions.GetCityById,
          UserPermissions.CreateNewCity,
          UserPermissions.UpdateCityTitleById,
          UserPermissions.DeleteCityById,
          UserPermissions.GetArrayOfPath,
          UserPermissions.GetActiveTicketsByUserId,
          UserPermissions.DeleteTicketById,
          UserPermissions.CreateNewTicket,
          UserPermissions.UpdateTicketHolderCredentials,
          UserPermissions.GetTicketsInCartByUserId,
          UserPermissions.UpdateTicketStatusToOrdered,
          UserPermissions.SendMessages,
          UserPermissions.GetMessages,
          UserPermissions.PublishToRooms,
          UserPermissions.SignoutSelectSession,
          UserPermissions.SignoutSessions,
          UserPermissions.GetUserDevices
      ],
    },
  });

  const Manager = await prisma.role.create({
    data: {
      type: UserRoles.Manager,
      permissions: [
          UserPermissions.GetAllUsers,
          UserPermissions.GetUserById,
          UserPermissions.GetUsersBySearchQuery,
          UserPermissions.UpdateUser,
          UserPermissions.GetAllUsers,
          UserPermissions.GetCityById,
          UserPermissions.CreateNewCity,
          UserPermissions.UpdateCityTitleById,
          UserPermissions.DeleteCityById,
          UserPermissions.GetArrayOfPath,
          UserPermissions.GetAllTickets,
          UserPermissions.GetActiveTicketsByUserId,
          UserPermissions.DeleteTicketById,
          UserPermissions.UpdateTicketStatus,
          UserPermissions.UpdateTicketHolderCredentials,
          UserPermissions.GetRooms,
          UserPermissions.GetMessages,
          UserPermissions.SendMessages,
          UserPermissions.JoinRoom,
          UserPermissions.SubscribeToRooms,
          UserPermissions.SignoutSelectSession,
          UserPermissions.SignoutSessions,
          UserPermissions.GetUserDevices
      ],
    },
  });

  const Admin = await prisma.role.create({
    data: {
      type: UserRoles.Admin,
      permissions: [UserPermissions.All],
    },
  });

  mockCityData.map(async (city) => {
    await prisma.city.create({
      data: { ...city },
    });
  });

  mockPlaneData.map(async (plane) => {
    await prisma.plane.create({
      data: { ...plane },
    });
  });

  const cities = await prisma.city.findMany();
  const planes = await prisma.plane.findMany();
  setTimeout(() => {
    mock(cities, planes).then((mockFlightsData) =>
      mockFlightsData.map(async (flight) => {
        await prisma.flight.create({
          data: { ...flight },
        });
      })
    );
  }, 2000)

}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });
