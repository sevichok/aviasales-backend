# Use an official Node.js runtime as a parent image
#FROM node:17.0.1-alpine
#WORKDIR /app/backend
#COPY package*.json ./
#RUN npm install
#COPY . .
#RUN npx prisma generate
#EXPOSE 4000
#CMD npx prisma migrate deploy && npm run start:dev

FROM node:18
WORKDIR /apps
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 4444
CMD npx prisma migrate deploy && npm run start:dev