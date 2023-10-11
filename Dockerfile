FROM node:16-alpine as builder
RUN npm i -g pnpm@7.11.0
WORKDIR /app
COPY . /app
RUN pnpm i
RUN pnpm run build

FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/*.json /app
EXPOSE 8080
CMD ["npm", "start"]
