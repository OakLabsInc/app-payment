FROM oaklabs/oak:5.0.10

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install --production && npm cache clean --force

COPY . /app

CMD ["/app/src/server.js"]

ENV TZ=America/Los_Angeles \
    PAYMENT_PORT=8003 \
    TERMINAL_IP=192.168.86.43 \
    PORT=9000