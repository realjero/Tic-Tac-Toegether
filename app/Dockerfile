FROM node:20.9.0-alpine AS base

# BACKEND STAGE 1: DEPENDENCIES
FROM base as backend_deps
WORKDIR /app

COPY /backend/package*.json ./
RUN npm ci

# FRONTEND STAGE 1: DEPENDENCIES
FROM base as frontend_deps
WORKDIR /app

COPY /frontend/package*.json ./
RUN npm ci

# BACKEND TEST STAGE
FROM backend_deps as backend_test
WORKDIR /app

COPY --from=backend_deps /app/node_modules ./node_modules
COPY ./backend .

# FRONTEND TEST STAGE
FROM frontend_deps as frontend_test
WORKDIR /app

COPY --from=frontend_deps /app/node_modules ./node_modules
COPY ./frontend .

# BACKEND STAGE 2: BUILD
FROM backend_deps as backend_build
WORKDIR /app

COPY --from=backend_deps /app/node_modules ./node_modules
COPY ./backend .
RUN npm run build

# FRONTEND STAGE 2: BUILD
FROM frontend_deps as frontend_build
WORKDIR /app

COPY --from=frontend_deps /app/node_modules ./node_modules
COPY ./frontend .
RUN npm run build


# APP STAGE 3: RELEASE
FROM base as release
WORKDIR /app

COPY --from=backend_deps /app/node_modules ./backend/node_modules
COPY --from=backend_build /app/dist ./backend/dist
COPY --from=frontend_build /app/dist/ ./frontend/dist

EXPOSE 3000
CMD ["node", "backend/dist/main.js"]
