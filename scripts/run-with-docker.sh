#!/bin/bash

# Script to run the application using Docker Compose
# This starts only the required services (postgres and redis) without building the full application

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section header
print_section() {
  echo -e "\n${GREEN}==== $1 ====${NC}\n"
}

# Function to print status
print_status() {
  echo -e "${YELLOW}$1${NC}"
}

# Function to print error
print_error() {
  echo -e "${RED}ERROR: $1${NC}"
}

# Start script
print_section "Community.io Docker Development Environment"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
  print_error "Docker Compose is not installed. Please install Docker Compose."
  exit 1
fi

# Check for .env file
print_status "Checking for .env file..."
if [ ! -f .env ]; then
  print_status "Creating .env file from example..."
  cp .env.example .env
  echo -e "${GREEN}✓${NC} Created .env file. Please update with your credentials."
else
  echo -e "${GREEN}✓${NC} .env file already exists."
fi

# Start required services
print_status "Starting PostgreSQL and Redis services..."
docker-compose up -d postgres redis pgadmin redis-commander
echo -e "${GREEN}✓${NC} Services started."

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 5

# Update .env file with correct connection settings
print_status "Updating .env file with Docker connection settings..."
sed -i.bak 's/DB_HOST=.*/DB_HOST=localhost/' .env
sed -i.bak 's/REDIS_HOST=.*/REDIS_HOST=localhost/' .env
echo -e "${GREEN}✓${NC} Connection settings updated."

# Run migrations
print_status "Running database migrations..."
npm run migrate:up
echo -e "${GREEN}✓${NC} Database migrations completed."

# Seed database
print_status "Seeding database..."
npm run seed
echo -e "${GREEN}✓${NC} Database seeded."

# Start application
print_section "Services are ready! Starting application..."
print_status "Starting the application in development mode..."
print_status "Press Ctrl+C to stop the application"
echo

# Run the application
npm run dev

exit 0