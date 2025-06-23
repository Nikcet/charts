FROM node:22-alpine

WORKDIR /app

ARG DATABASE_URL

COPY package*.json ./
RUN npm install

COPY . .

ENV DATABASE_URL=$DATABASE_URL

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]