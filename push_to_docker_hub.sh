#!/bin/bash

# --- Configuration ---
DOCKER_USERNAME="cptnord" # Replace with your Docker Hub username
REPO_NAME="lenscontract" # Your Docker Hub repository name (e.g., lenscontract)

# --- Login to Docker Hub ---
# echo "Logging in to Docker Hub..."
# docker login -u "$DOCKER_USERNAME"

# if [ $? -ne 0 ]; then
#   echo "Docker login failed. Exiting."
#   exit 1
# fi

# --- Build Docker Images ---
echo "Building Docker images..."
docker-compose build

if [ $? -ne 0 ]; then
  echo "Docker build failed. Exiting."
  exit 1
fi

# --- Tag and Push Backend Image ---
echo "Tagging and pushing backend image..."
docker tag ${REPO_NAME}-backend "${DOCKER_USERNAME}/${REPO_NAME}-backend:latest"
docker push "${DOCKER_USERNAME}/${REPO_NAME}-backend:latest"

if [ $? -ne 0 ]; then
  echo "Failed to push backend image. Exiting."
  exit 1
fi

# --- Tag and Push Frontend Image ---
echo "Tagging and pushing frontend image..."
docker tag ${REPO_NAME}-frontend "${DOCKER_USERNAME}/${REPO_NAME}-frontend:latest"
docker push "${DOCKER_USERNAME}/${REPO_NAME}-frontend:latest"

if [ $? -ne 0 ]; then
  echo "Failed to push frontend image. Exiting."
  exit 1
fi

echo "Successfully pushed all images to Docker Hub!"
