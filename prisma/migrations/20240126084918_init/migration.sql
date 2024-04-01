-- CreateEnum
CREATE TYPE "UserRoles" AS ENUM ('admin', 'client', 'manager');

-- CreateEnum
CREATE TYPE "FlightStatus" AS ENUM ('planned', 'flying', 'fulfilled', 'canceled');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('fulfilled', 'in cart', 'canceled', 'ordered');

-- CreateEnum
CREATE TYPE "UserPermissions" AS ENUM ('permissions.all', 'permissions.signout', 'permissions.password-change', 'permissions.refresh-token', 'permissions.get-all-users', 'permissions.get-user-by-id', 'permissions.get-users-by-search-query', 'permissions.update-user', 'permissions.get-all-cities', 'permissions.get-city-by-id', 'permissions.create-new-city', 'permissions.update-city-title-by-id', 'permissions.delete-city-by-id', 'permissions.get-array-of-path', 'permissions.change-flight-status', 'permissions.change-flight-price', 'permissions.get-all-tickets', 'permissions.get-ticket-by-id', 'permissions.get-active-tickets-by-user-id', 'permissions.delete-ticket-by-id', 'permissions.update-ticket-status', 'permissions.create-new-ticket', 'permissions.update-ticket-holder-credentials', 'permissions.get-tickets-in-cart-by-user-id', 'permissions.update-ticket-status-to-ordered', 'permissions.get-rooms', 'permissions.get-messages', 'permissions.send-messages', 'permissions.join-room', 'permissions.publish-to-rooms', 'permissions.subscribe-to-rooms', 'permissions.signout-selected-session', 'permissions.signout-sessions', 'permissions.get-user-devices');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role_id" UUID NOT NULL,
    "role_type" "UserRoles" NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "reset_token" TEXT,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" UUID NOT NULL,
    "holder_first_name" TEXT NOT NULL,
    "holder_last_name" TEXT NOT NULL,
    "flight_id" UUID NOT NULL,
    "status" "TicketStatus" NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flights" (
    "id" UUID NOT NULL,
    "from_city_id" UUID NOT NULL,
    "to_city_id" UUID NOT NULL,
    "start_flight_date" TIMESTAMPTZ NOT NULL,
    "end_flight_date" TIMESTAMPTZ NOT NULL,
    "status" "FlightStatus" NOT NULL,
    "price" INTEGER NOT NULL,
    "available_seats" INTEGER NOT NULL,
    "plane_id" UUID NOT NULL,

    CONSTRAINT "flights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planes" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,

    CONSTRAINT "planes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "type" "UserRoles" NOT NULL,
    "permissions" "UserPermissions"[],

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_id_idx" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "devices_user_id_device_id_key" ON "devices"("user_id", "device_id");

-- CreateIndex
CREATE UNIQUE INDEX "devices_device_id_reset_token_key" ON "devices"("device_id", "reset_token");

-- CreateIndex
CREATE INDEX "tickets_id_idx" ON "tickets"("id");

-- CreateIndex
CREATE INDEX "flights_id_from_city_id_to_city_id_idx" ON "flights"("id", "from_city_id", "to_city_id");

-- CreateIndex
CREATE INDEX "planes_id_idx" ON "planes"("id");

-- CreateIndex
CREATE INDEX "cities_id_idx" ON "cities"("id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_id_type_key" ON "roles"("id", "type");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_role_type_fkey" FOREIGN KEY ("role_id", "role_type") REFERENCES "roles"("id", "type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "flights"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_from_city_id_fkey" FOREIGN KEY ("from_city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_to_city_id_fkey" FOREIGN KEY ("to_city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_plane_id_fkey" FOREIGN KEY ("plane_id") REFERENCES "planes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
