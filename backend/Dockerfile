FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV PORT=4000
ENV UPLOADS_DIRECTORY=/app/uploads

RUN mkdir -p /app/uploads

EXPOSE 4000

CMD ["node", "src/index.js"]
