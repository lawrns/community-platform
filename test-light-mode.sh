#!/bin/bash
# Script to quickly test if the light mode changes are working

echo "Checking if the server is running..."
curl -s --head http://localhost:9200 > /dev/null
if [ $? -ne 0 ]; then
  echo "Server is not running. Starting it..."
  cd frontend
  npm run dev &
  sleep 5  # Wait for server to start
fi

echo "Fetching sample of the rendered page..."
curl -s http://localhost:9200 | grep -A 3 "backdrop-blur-md" | head -4
echo ""

echo "Checking for light mode CSS class..."
curl -s http://localhost:9200 | grep -A 2 '<script>' | head -3
echo ""

echo "Checking the footer color style..."
curl -s http://localhost:9200 | grep -A 3 "class=\"relative backdrop-blur-md bg-glass" | tail -4 | head -1
echo ""

echo "Test completed!"