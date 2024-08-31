FROM node:20.16.0-alpine3.20

# Install dependencies
RUN apk add --no-cache redis

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

# Expose the ports for Node.js app and Redis
EXPOSE 5001 6379

# Copy the start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Use the start script as the entry point
CMD ["/start.sh"]