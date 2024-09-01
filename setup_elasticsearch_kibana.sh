#!/bin/bash

# Set variables
ES_VERSION="8.15.0"
ELASTIC_PASSWORD=""
ENROLLMENT_TOKEN=""

# Install Docker (this step may vary depending on the Linux distribution)
# For Ubuntu:
# sudo apt-get update
# sudo apt-get install docker.io

# Allocate memory for Docker (this step depends on your system configuration)
# You may need to adjust Docker settings manually

# Create a new Docker network
docker network create elastic

# Pull Elasticsearch Docker image
docker pull docker.elastic.co/elasticsearch/elasticsearch:$ES_VERSION

# Start Elasticsearch container
docker run --name es01 --net elastic -p 9200:9200 -it -m 1GB -d docker.elastic.co/elasticsearch/elasticsearch:$ES_VERSION

# Wait for Elasticsearch to start
sleep 30

# Get elastic password and enrollment token
ELASTIC_PASSWORD=$(docker exec -it es01 /usr/share/elasticsearch/bin/elasticsearch-reset-password -u elastic -b)
ENROLLMENT_TOKEN=$(docker exec -it es01 /usr/share/elasticsearch/bin/elasticsearch-create-enrollment-token -s kibana)

echo "Elastic password: $ELASTIC_PASSWORD"
echo "Enrollment token: $ENROLLMENT_TOKEN"

# Copy SSL certificate
docker cp es01:/usr/share/elasticsearch/config/certs/http_ca.crt .

# Test Elasticsearch connection
curl --cacert http_ca.crt -u elastic:$ELASTIC_PASSWORD https://localhost:9200

# Create enrollment token for new node
NODE_ENROLLMENT_TOKEN=$(docker exec -it es01 /usr/share/elasticsearch/bin/elasticsearch-create-enrollment-token -s node)

# Start a second Elasticsearch node
docker run -e ENROLLMENT_TOKEN="$NODE_ENROLLMENT_TOKEN" --name es02 --net elastic -it -m 1GB -d docker.elastic.co/elasticsearch/elasticsearch:$ES_VERSION

# Wait for the second node to join
sleep 30

# Verify nodes
curl --cacert http_ca.crt -u elastic:$ELASTIC_PASSWORD https://localhost:9200/_cat/nodes

# Pull Kibana Docker image
docker pull docker.elastic.co/kibana/kibana:$ES_VERSION

# Start Kibana container
docker run --name kib01 --net elastic -p 5601:5601 -d docker.elastic.co/kibana/kibana:$ES_VERSION

echo "Elasticsearch and Kibana setup complete."
echo "Access Kibana at: http://localhost:5601"
echo "Use the enrollment token to configure Kibana:"
echo "$ENROLLMENT_TOKEN"
echo "Log in with username 'elastic' and password:"
echo "$ELASTIC_PASSWORD"
