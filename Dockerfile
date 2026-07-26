FROM node:25-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY attendance-ui/package*.json attendance-ui/
RUN npm ci
COPY . .
RUN npm run build --workspace=@midnight-ntwrk/attendance-ui
FROM node:25-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/attendance-ui/.next/standalone ./
COPY --from=build /app/attendance-ui/.next/static ./attendance-ui/.next/static
EXPOSE 3000
CMD ["node", "attendance-ui/server.js"]
