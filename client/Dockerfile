# stage1 - build react app first 
#FROM node:alpine as build
#WORKDIR /app
#ENV PATH /app/node_modules/.bin:$PATH
#COPY ./package.json /app/
#RUN yarn 

# stage1 optimized - 
# you need to rebuild "nodebuild" image everytime a new package was used 
# 
FROM alexjunq/nodebuild as build
COPY . /app
ARG REACT_APP_MYBUSWAY_SERVER
ENV REACT_APP_MYBUSWAY_SERVER $REACT_APP_MYBUSWAY_SERVER
RUN yarn build

# stage 2 - build the final image and copy the react build files
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d

# Copy .env file and shell script to container
WORKDIR /usr/share/nginx/html
COPY ./env.sh .
COPY .env .

# Add bash
RUN apk add --no-cache bash

# Make our shell script executable
RUN chmod +x env.sh

EXPOSE 80
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]
