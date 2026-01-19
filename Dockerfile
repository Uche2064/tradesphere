FROM node:24.7.0

WORKDIR /app

COPY package*.json ./

RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm ci

COPY . .

RUN chmod +x scripts/start.sh

EXPOSE 3000

CMD ["sh", "scripts/start.sh"]
