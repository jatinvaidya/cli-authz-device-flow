FROM node

WORKDIR "/opt/api"

COPY .env /opt/api
COPY api.js /opt/api

COPY package.json /opt/api
RUN npm install

EXPOSE 9090

CMD ["npm", "start"]
