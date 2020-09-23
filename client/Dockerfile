# stage1 - build react app first 
FROM node:alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY ./package.json /app/
RUN yarn 
COPY . /app
ARG REACT_APP_MYBUSWAY_SERVER
ENV REACT_APP_MYBUSWAY_SERVER $REACT_APP_MYBUSWAY_SERVER
RUN yarn build

# stage 2 - build the final image and copy the react build files
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# RUN rm /etc/nginx/conf.d/default.conf
# COPY nginx/nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
