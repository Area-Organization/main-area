FROM oven/bun:1

WORKDIR /app

COPY . .

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN bun install --no-save --ignore-scripts

WORKDIR /app/apps/backend

RUN bunx prisma generate

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["bun", "run", "apps/backend/src/index.ts"]
