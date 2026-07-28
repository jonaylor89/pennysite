FROM node:22-slim AS builder

RUN corepack enable pnpm

WORKDIR /app
COPY package.json ./

# pnpm v11 requires explicit build script approval
RUN echo 'allowBuilds:' > pnpm-workspace.yaml && \
    echo "  esbuild: true" >> pnpm-workspace.yaml && \
    echo "  protobufjs: true" >> pnpm-workspace.yaml && \
    echo "  '@google/genai': true" >> pnpm-workspace.yaml && \
    echo "  '@node-rs/bcrypt': true" >> pnpm-workspace.yaml && \
    echo "  '@swc/core': true" >> pnpm-workspace.yaml && \
    echo "  core-js: true" >> pnpm-workspace.yaml

RUN pnpm install
COPY . .
RUN pnpm run build

FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/index.js"]
