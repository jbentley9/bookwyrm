# Development environment
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x docker-entrypoint.sh

EXPOSE 5173