#!/bin/sh

# Start Redis
redis-server --daemonize yes

# Start Node.js application
npm run prod