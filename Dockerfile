FROM node:13

WORKDIR /usr/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

ENV NODE_ENV=production

RUN yarn build

ENTRYPOINT ["node", "dist/index.js"]
CMD ["migrateAndStart"]
