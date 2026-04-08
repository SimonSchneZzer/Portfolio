FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY apps/api/package.json ./package.json
RUN pnpm install

COPY apps/api/tsconfig.json ./tsconfig.json
COPY apps/api/src ./src
COPY knowledge /app/knowledge
COPY data /app/data

RUN pnpm build

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/index.js"]

