FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .
ARG API_BASE_URL
ENV API_BASE_URL=$API_BASE_URL
RUN npm run build

EXPOSE 3000 

CMD ["npm","start"]