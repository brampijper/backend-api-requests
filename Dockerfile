# syntax=docker/dockerfile:1

# Download ARM-64 version for Linux with Puppeteer included
FROM zenika/alpine-chrome:with-node

# Ensure we're running as root
USER root

# Create a user and group named 'chrome' if it doesn't exist, otherwise just add the user
RUN addgroup -S chrome || true && adduser -S -G chrome chrome || true

# Use production node environment by default.
ENV NODE_ENV production

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Working directory
WORKDIR /app

# Ensure necessary files exist
RUN mkdir -p /app/files && \
    touch /app/files/cache.json && \
    mkdir -p /app/files/screenshots

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Copy the rest of the source files into the image.
COPY . .

# Copy .env file into the container
COPY .env .env

# Change ownership to a non-root user for extra safety. 
RUN chown -R chrome:chrome /app

# Set the user to 'chrome' for running the application
USER chrome

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD node ./bin/www
