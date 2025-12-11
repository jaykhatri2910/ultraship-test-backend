FROM node:18-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
# Install all deps (includes faker for seed)
RUN npm install

COPY src ./src

EXPOSE 4000
CMD ["sh", "-c", "node src/server.js"]