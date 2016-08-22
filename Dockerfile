FROM node
MAINTAINER Thibault Coupin <thibault.coupin@gmail.com>

RUN apt-get update && apt-get install -y imagemagick
RUN mkdir -p /news
WORKDIR /news
COPY package.json /news
RUN npm install && npm install -g forever
VOLUME /news/conf
CMD forever src/js/index.js conf/conf.json
ENV TZ Europe/Paris
ENV LANG french
ADD src /news/src
