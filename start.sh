#!/bin/sh

# Start Redis server with custom config if it exists, otherwise use default
if [ -f "/etc/redis/redis.conf" ]; then
    redis-server /etc/redis/redis.conf --daemonize yes
else
    redis-server --daemonize yes
fi

# Wait for Redis to start
while ! redis-cli ping; do
  sleep 1
done

# Start your Node.js application
npm start