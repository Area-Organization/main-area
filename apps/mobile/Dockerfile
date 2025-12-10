FROM node:20-slim

WORKDIR /app

RUN npm install -g bun

COPY package.json bun.lock ./
COPY packages ./packages

COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/mobile/package.json ./apps/mobile/package.json

RUN bun install --no-save --ignore-scripts

WORKDIR /app
COPY apps/mobile ./apps/mobile

WORKDIR /app/apps/mobile

ENV EXPO_PUBLIC_API_URL="http://localhost:8080"

RUN npx expo export -p web --output-dir dist

RUN npm install -g serve

ENV PORT=8082
EXPOSE 8082

CMD ["serve", "dist", "-p", "8082", "--single"]