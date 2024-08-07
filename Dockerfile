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

# Define build arguments
ARG NODE_ENV
ARG CLIENT_URL
ARG ADMIN_URL
ARG JWT_USER_SECRET
ARG JWT_ADMIN_SECRET
ARG BASE_URL
ARG REDIS_HOST
ARG REDIS_PORT
ARG PORT_DEV
ARG DB_URL_DEV
ARG PORT_PROD
ARG DB_NAME
ARG DB_USER
ARG DB_PASSWORD
ARG DB_HOST
ARG PORT_TEST
ARG DB_URL_TEST
ARG STRIPE_SECRET_KEY
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG GOOGLE_CALLBACK_URL
ARG CLAUDE_SECRET
ARG CLAUDE_MODEL
ARG CLAUDE_MAX_TOKENS
ARG CLOUDINARY_CLOUD_NAME
ARG CLOUDINARY_API_KEY
ARG CLOUDINARY_API_SECRET
ARG SUMSUB_SECRET_KEY
ARG SUMSUB_APP_TOKEN
ARG SUMSUB_LEVEL_NAME
ARG RAPIDAPI_KEY
ARG MAIL_HOST
ARG MAIL_PORT
ARG MAIL_USER
ARG MAIL_PASS

# Pass the build arguments as environment variables
ENV NODE_ENV=$NODE_ENV \
    CLIENT_URL=$CLIENT_URL \
    ADMIN_URL=$ADMIN_URL \
    JWT_USER_SECRET=$JWT_USER_SECRET \
    JWT_ADMIN_SECRET=$JWT_ADMIN_SECRET \
    BASE_URL=$BASE_URL \
    REDIS_HOST=$REDIS_HOST \
    REDIS_PORT=$REDIS_PORT \
    PORT_DEV=$PORT_DEV \
    DB_URL_DEV=$DB_URL_DEV \
    PORT_PROD=$PORT_PROD \
    DB_NAME=$DB_NAME \
    DB_USER=$DB_USER \
    DB_PASSWORD=$DB_PASSWORD \
    DB_HOST=$DB_HOST \
    PORT_TEST=$PORT_TEST \
    DB_URL_TEST=$DB_URL_TEST \
    STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY \
    GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
    GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET \
    GOOGLE_CALLBACK_URL=$GOOGLE_CALLBACK_URL \
    CLAUDE_SECRET=$CLAUDE_SECRET \
    CLAUDE_MODEL=$CLAUDE_MODEL \
    CLAUDE_MAX_TOKENS=$CLAUDE_MAX_TOKENS \
    CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME \
    CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY \
    CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET \
    SUMSUB_SECRET_KEY=$SUMSUB_SECRET_KEY \
    SUMSUB_APP_TOKEN=$SUMSUB_APP_TOKEN \
    SUMSUB_LEVEL_NAME=$SUMSUB_LEVEL_NAME \
    RAPIDAPI_KEY=$RAPIDAPI_KEY \
    MAIL_HOST=$MAIL_HOST \
    MAIL_PORT=$MAIL_PORT \
    MAIL_USER=$MAIL_USER \
    MAIL_PASS=$MAIL_PASS

# Build the application
RUN npm run build

# Supervisor configuration file
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose the ports
EXPOSE 5001 6379

# Start Supervisor to manage services
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
