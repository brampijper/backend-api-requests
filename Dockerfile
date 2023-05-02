# Use Node.js version 16 as the base image
FROM node:16-alpine

# Install Firefox
RUN apk add --no-cache xvfb pciutils firefox-esr

# Set the Firefox binary path
ENV FIREFOX_BIN=/usr/bin/firefox-esr

# Set the Firefox headless mode option
ENV FIREFOX_OPTIONS="--headless"

ENV LD_LIBRARY_PATH=/usr/lib

# Set the working directory to the root directory of the repository
WORKDIR /backend-api-requests

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Expose the port that the application will listen on
EXPOSE 8080

# Start xvfb and the application
CMD ["sh", "-c", "Xvfb :99 -screen 0 1024x768x24 -ac +extension GLX +render -noreset & npm start"]
