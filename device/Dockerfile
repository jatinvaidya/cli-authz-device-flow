FROM node

WORKDIR /opt/device

COPY .env /opt/device
COPY device.js /opt/device

COPY package.json /opt/device
RUN npm install

CMD ["npm", "start"]
