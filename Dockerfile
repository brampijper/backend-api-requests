# Use Node.js version 17 as the base image
FROM node:17

# Set the working directory to the root directory of the repository
WORKDIR /backend-api-requests

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Add Chromium repository since the package is not available.
RUN apt-get update && \
    apt-get install -y software-properties-common && \
    add-apt-repository "deb http://ppa.launchpad.net/canonical-chromium-builds/stage/ubuntu bionic main" -y && \
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 4E1B983C5B393194 && \

# Install dependencies and Chromium browser # --- Installing puppeteer ---
RUN apt-get upgrade && \
    apt-get install -y ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 chromium-browser

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

# Expose the port that the application will listen on
EXPOSE 8080

# Start the application
CMD [ "npm", "start" ]
