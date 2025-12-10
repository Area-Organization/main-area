FROM oven/bun:1

WORKDIR /app

COPY . .

RUN bun install --no-save

WORKDIR /app/apps/web

RUN bun run build

ENV NODE_ENV=production

ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["bun", "run", "build/index.js"]