export enum ErrorCodes {
  FieldShouldBeString = 'errors.field-invalid.should-be-string',
  FieldShouldBeNumber = 'errors.field-invalid.should-be-number',
  FieldShouldBeEnum = 'errors.field-invalid.should-be-enum',
  FieldShouldBeEmail = 'errors.field-invalid.should-be-email',
  FieldShouldBeArray = 'errors.field-invalid.should-be-array',

  InvalidForm = 'errors.invalid-form',
  NotAuthorizedRequest = 'errors.not-authorized.request',
  InvalidPassword = 'errors.invalid-password',
  ExpiredToken = 'errors.expired-token',
  Error = 'errors.error',
  AlreadyRegistered = 'errors.alredy-registered',
  NotExists_User = 'errors.auth.not-exists.user',

  NoUser = 'errors.no-user',
  NoUsers = 'errors.no-users',
  CreateUserError = 'errors.create-user',
  UpdateUserError = 'errors.update-user',

  ExistedCity = 'errors.existed-city',
  NoCity = 'errors.no-city',
  NoCities = 'errors.no-cities',
  CreateCityError = 'errors.create-city',
  UpdateCityError = 'errors.update-city',

  NoTicket = 'errors.no-ticket',
  NoTickets = 'errors.no-tickets',
  CreateTicketError = 'errors.create-ticket',
  UpdateTicketCredsError = 'errors.update-ticket-creds',
  UpdateTicketStatusError = 'errors.update-ticket-status',

  NoFlights = 'errors.no-flights',
  NoPath = 'errors.no-path',
  SortedPathsByPriceError = 'errors.no-sorted-paths-by-price',
  NoAvaliableSeats = 'errors.no-available-seats',

  NoRooms = "errors.no-rooms",
  NoMessages = "errors.no-messages"
}
