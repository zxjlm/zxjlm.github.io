FROM node:24.13.1-alpine AS build-stage

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile --store-dir /root/.pnpm-store

COPY . .
RUN SITE_ENV=production pnpm build

FROM nginx:stable-alpine as production-stage

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
