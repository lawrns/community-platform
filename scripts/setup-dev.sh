#!/bin/bash

# Setup Development Environment Script
# This script helps set up the local development environment for the Community.io platform

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

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Start script
print_section "Community.io Development Environment Setup"

# Check for .env file
print_status "Checking for .env file..."
if [ ! -f .env ]; then
  print_status "Creating .env file from example..."
  cp .env.example .env
  echo -e "${GREEN}✓${NC} Created .env file. Please update with your credentials."
else
  echo -e "${GREEN}✓${NC} .env file already exists."
fi

# Check Node.js and npm
print_status "Checking Node.js and npm..."
if ! command_exists node; then
  print_error "Node.js is not installed. Please install Node.js (>= 18.0.0)"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
echo -e "${GREEN}✓${NC} Node.js version: $NODE_VERSION"

if ! command_exists npm; then
  print_error "npm is not installed. Please install npm"
  exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓${NC} npm version: $NPM_VERSION"

# Install dependencies
print_status "Installing npm dependencies..."
npm install
echo -e "${GREEN}✓${NC} Dependencies installed."

# Check for Docker
print_status "Checking for Docker..."
if ! command_exists docker; then
  print_error "Docker is not installed. Some services (PostgreSQL, Redis) are easier to set up with Docker."
  print_status "You can download Docker from https://www.docker.com/products/docker-desktop"
  
  # Ask if user wants to continue
  read -p "Do you want to continue with the setup without Docker? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Setup aborted. Please install Docker and run this script again."
    exit 1
  fi
else
  echo -e "${GREEN}✓${NC} Docker is installed."

  # Check if PostgreSQL and Redis containers are running
  print_status "Checking PostgreSQL and Redis containers..."
  
  # Start PostgreSQL if not running
  if ! docker ps | grep -q postgres; then
    print_status "Starting PostgreSQL container..."
    docker run --name postgres-community -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=communityio -p 5432:5432 -d postgres:14
    echo -e "${GREEN}✓${NC} PostgreSQL container started."
  else
    echo -e "${GREEN}✓${NC} PostgreSQL container is already running."
  fi
  
  # Start Redis if not running
  if ! docker ps | grep -q redis; then
    print_status "Starting Redis container..."
    docker run --name redis-community -p 6379:6379 -d redis
    echo -e "${GREEN}✓${NC} Redis container started."
  else
    echo -e "${GREEN}✓${NC} Redis container is already running."
  fi
fi

# Setup database
print_status "Setting up database..."
if command_exists docker && docker ps | grep -q postgres; then
  # Wait for PostgreSQL to be ready
  print_status "Waiting for PostgreSQL to be ready..."
  sleep 5
  
  # Run migrations
  print_status "Running database migrations..."
  npm run migrate:up
  echo -e "${GREEN}✓${NC} Database migrations completed."
  
  # Seed database
  print_status "Seeding database..."
  npm run seed
  echo -e "${GREEN}✓${NC} Database seeded successfully."
else
  print_status "Please make sure PostgreSQL is installed and running with the following settings:"
  echo "  Host: localhost"
  echo "  Port: 5432"
  echo "  Database: communityio"
  echo "  User: postgres"
  echo "  Password: postgres"
  echo
  print_status "Then run these commands to set up the database:"
  echo "  npm run migrate:up"
  echo "  npm run seed"
fi

# Final instructions
print_section "Setup Complete!"
echo "To start the development server, run:"
echo "  npm run dev"
echo
echo "If you encounter any issues, please check the troubleshooting section in the documentation."

exit 0