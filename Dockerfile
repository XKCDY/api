FROM node:13

ENV NODE_ENV=production

WORKDIR /usr/app

COPY package.json yarn.lock .

RUN yarn install

COPY . .

RUN yarn build

CMD ["./start.sh"]
