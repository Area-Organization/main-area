FROM oven/bun:1

WORKDIR /app

COPY . .

RUN bun install --no-save --ignore-scripts

WORKDIR /app/apps/web

ENV NODE_ENV=production
ENV PORT=3000

ARG BACKEND_API_URL
ENV BACKEND_API_URL=$BACKEND_API_URL

RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "build/index.js"]
