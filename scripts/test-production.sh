#!/bin/bash

set -e

echo "🚀 Testing production build locally with nginx"
echo ""

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Build all packages
echo "📦 Building all packages..."
node scripts/build-all.js

# Check if build was successful
if [ ! -f "packages/root-config/dist/importmap.json" ]; then
    echo "❌ Build failed: importmap.json not found"
    exit 1
fi

echo ""
echo "✅ Build completed successfully"
echo ""

# Build and start docker container
echo "🐳 Building Docker image..."
docker-compose build

echo ""
echo "🚀 Starting nginx server..."
docker-compose up -d

echo ""
echo "✅ Production server is running!"
echo ""
echo "📍 Access your application at: http://localhost:8080"
echo "📍 Import map: http://localhost:8080/importmap.json"
echo "📍 Health check: http://localhost:8080/health"
echo ""
echo "📊 View logs: docker-compose logs -f"
echo "🛑 Stop server: docker-compose down"
echo ""

# Wait for nginx to start
sleep 2

# Test if server is running
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Server health check passed!"
    echo ""
    echo "🎉 You can now test your production build in the browser"
else
    echo "⚠️  Server might still be starting... check logs with: docker-compose logs"
fi
