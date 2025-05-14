#!/bin/bash
# Database Setup Script
# This script sets up the database for development

set -e  # Exit on error

echo "Setting up database for community.io..."

# Check if PostgreSQL is running
if ! pg_isready > /dev/null 2>&1; then
  echo "PostgreSQL is not running. Please start PostgreSQL and try again."
  exit 1
fi

# Check for pgvector extension
echo "Checking for pgvector extension..."
if ! psql -t -c "SELECT 1 FROM pg_available_extensions WHERE name = 'vector'" | grep -q 1; then
  echo "Error: pgvector extension is not available."
  echo "Please install the pgvector extension and try again."
  echo "Installation instructions: https://github.com/pgvector/pgvector#installation"
  exit 1
fi

# Source environment variables if .env file exists
if [ -f .env ]; then
  echo "Loading environment variables from .env..."
  source <(grep -v '^#' .env | sed -E 's/(.*)=(.*)/export \1="\2"/')
fi

# Set database variables from environment or use defaults
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-communityio}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

echo "Creating database $DB_NAME if it doesn't exist..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME WITH ENCODING 'UTF8'" 2>/dev/null || echo "Database already exists, continuing..."

echo "Creating pgvector extension in $DB_NAME if it doesn't exist..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS vector;"

echo "Running database migrations..."
npm run migrate up

echo "Seeding the database with sample data..."
npm run seed

echo "Database setup complete!"
echo "You can now start the application with 'npm run dev'"