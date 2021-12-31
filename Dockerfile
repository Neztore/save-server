FROM node:lts-alpine
ARG port
ARG nameLength
ENV NODE_ENV=production port=${port:-80} nameLength=$nameLength
RUN apk add --no-cache python3 make g++
RUN npm config set python python3
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
RUN mkdir -p uploads
EXPOSE $port
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
