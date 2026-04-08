FROM node:22-alpine

WORKDIR /app

RUN corepack enable

ARG NEXT_PUBLIC_CHAT_API_URL=/api/chat
ENV NEXT_PUBLIC_CHAT_API_URL=${NEXT_PUBLIC_CHAT_API_URL}

COPY apps/web/package.json ./package.json
RUN pnpm install

COPY apps/web /app

RUN pnpm build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["pnpm", "start"]
