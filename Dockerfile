# Use the official Node.js image from Docker Hub
FROM node:20.16.0-alpine3.20

# Install dependencies
RUN apk add --no-cache \
    redis \
    mongodb-tools \
    supervisor

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Supervisor configuration file
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose the ports
EXPOSE 5001 6379

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
