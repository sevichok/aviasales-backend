FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build:chat-gateway
EXPOSE 4444
CMD npx prisma migrate deploy && npm run start:chat-gateway