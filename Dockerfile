FROM zenika/alpine-chrome:102-with-puppeteer as base

USER root

RUN mkdir /app && chown -R guest /app

WORKDIR /app

ENV SHELL_IN_CONTAINER=1
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

CMD ["/usr/bin/node", "src/main.js"]

FROM base as build

COPY package-lock.json .
COPY package.json .
COPY src ./src

RUN npm install

FROM base as prod

COPY --from=build /app /app
