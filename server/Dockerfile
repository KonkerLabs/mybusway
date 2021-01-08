FROM node:alpine

## Add the wait script to the image
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN chmod +x /wait

WORKDIR /usr/src/app
COPY package*.json ./

RUN yarn install 

COPY . .
EXPOSE 8080


CMD ["node", "src/index.js"]