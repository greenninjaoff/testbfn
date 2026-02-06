FROM node:20-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY . .
COPY ../../packages /packages
COPY ../../package.json ../../pnpm-workspace.yaml /tmp/root/
RUN pnpm install --frozen-lockfile=false
RUN pnpm build
EXPOSE 3000
CMD ["pnpm","start"]
