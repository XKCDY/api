FROM node:18-alpine AS base

RUN apk update \
	&& apk add --no-cache openssl\
	&& rm -rf /var/lib/apt/lists/* \
	&& rm -rf /var/cache/apk/*

WORKDIR /usr/app

COPY package.json yarn.lock ./
COPY prisma .

# Install prod dependencies
RUN yarn install --prod --frozen-lockfile

# Dependencies
FROM base AS dependencies

# Install dev dependencies
RUN yarn install --frozen-lockfile

# Build app
FROM dependencies AS builder

COPY . .
RUN yarn build

# Only copy essentials
FROM base AS prod

RUN yarn prisma generate

COPY --from=builder /usr/app/dist dist
COPY public public
COPY CHECKS CHECKS

ENV NODE_ENV=production

ENTRYPOINT ["yarn"]
CMD ["start:prod"]
