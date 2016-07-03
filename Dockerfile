FROM node
MAINTAINER Thibault Coupin <thibault.coupin@gmail.com>

RUN apt-get update && apt-get install -y imagemagick
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install

CMD npm start
