FROM node:24-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev
COPY server/ ./
USER node
EXPOSE 10000
CMD ["sh", "-c", "node migrate.mjs && exec node index.mjs"]
