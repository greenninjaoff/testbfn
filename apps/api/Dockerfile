FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY ../../package.json ../../pnpm-workspace.yaml /tmp/root/
# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
# Copy workspace
COPY . .
# Copy shared package
COPY ../../packages /packages
# Install deps
RUN pnpm install --frozen-lockfile=false
RUN pnpm build
EXPOSE 4000
CMD ["pnpm","start"]
