# #!/bin/sh

# # Start Redis
# redis-server --daemonize yes

# # Start Node.js application
# npm run prod


#!/bin/sh

# Start Redis
redis-server --daemonize yes

# Start Zookeeper (required for Kafka)
# /kafka/bin/zookeeper-server-start.sh -daemon /kafka/config/zookeeper.properties

# Start Kafka
# /kafka/bin/kafka-server-start.sh -daemon /kafka/config/server.properties

# Wait for Kafka to start
# sleep 10

# Start Node.js application
# npm run prod
npm start