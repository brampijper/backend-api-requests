# Use Node.js version 16 as the base image
FROM node:16-alpine

# Set the working directory to the root directory of the repository
WORKDIR /backend-api-requests

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# --- START ---
RUN apk add --no-cache chromium ca-certificates
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser
# --- END ---


# Expose the port that the application will listen on
EXPOSE 8080

# Start the application
CMD [ "npm", "start" ]
