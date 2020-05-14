FROM oaklabs/oak:5.0.10

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install --production && npm cache clean --force

COPY . /app

CMD ["/app/src/server.js"]

ENV TZ=America/Los_Angeles \
    PAYMENT_PORT=9001 \
    PORT=9000