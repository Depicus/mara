FROM node:12

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY mara.js ./

COPY /public ./public

ENV PORT=4343

EXPOSE 4343

CMD [ "node", "mara.js" ]