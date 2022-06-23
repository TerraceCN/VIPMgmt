# Build
FROM node:lts-slim as build

WORKDIR /build

ADD package.json /build
ADD yarn.lock /build
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list && \
    sed -i 's/security.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list && \
    apt-get update && \
    apt-get install python3 build-essential -y
RUN yarn config set registry https://registry.npmmirror.com && \
    yarn install
ADD . /build
RUN yarn build

# Production
FROM node:lts-alpine as prod

WORKDIR /app
EXPOSE 3000

ADD package.json /app
ADD yarn.lock /app
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk add --no-cache --virtual .build-deps alpine-sdk python3 && \
    yarn config set registry https://registry.npmmirror.com && \
    yarn install --production && \
    yarn cache clean && \
    apk del .build-deps && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

COPY --from=0 /build/dist /app/dist

CMD ["node", "dist/index.js"]