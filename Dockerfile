FROM ubuntu:18.04

WORKDIR /app

RUN apt update
RUN apt upgrade -y
RUN apt install curl -y
RUN curl -fsSL https://deb.nodesource.com/setup_19.x
RUN apt-get install -y nodejs
RUN apt install npm -y
RUN npm install -g yarn
COPY ./solana-twitter .

COPY ./solana-twitter/package.json .
RUN npm install --force
COPY ./solana-twitter .

CMD ./solana-install.sh; node index.js
