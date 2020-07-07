FROM oaklabs/oak:6.0.1

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install --production && npm cache clean --force

COPY . /app

CMD ["/app/src/server.js"]

EXPOSE 9000

ENV TZ=America/Los_Angeles \
    PAYMENT_PORT=8003 \
    TERMINAL_IP=192.168.86.43 \
    PORT=9000