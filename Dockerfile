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

# Expose the port that the application will listen on
EXPOSE 8080

# Start the application
CMD [ "npm", "start" ]
