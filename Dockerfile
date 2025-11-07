FROM node:24-alpine

RUN apk add --no-cache vips-dev vips-tools python3 make g++ wget sqlite

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
# create data folder
RUN mkdir -p /app/data

# entrypoint
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm","start"]
