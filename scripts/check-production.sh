#!/bin/bash

# Quick test script - just check if importmap is accessible

echo "Testing production build locally..."
echo ""

# Check if containers are running
if ! docker ps | grep -q react-single-spa-prod; then
    echo "❌ Container is not running"
    echo "Run: yarn test:production"
    exit 1
fi

echo "✅ Container is running"
echo ""

# Test health endpoint
echo "Testing health endpoint..."
if curl -s http://localhost:8080/health | grep -q "healthy"; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi

echo ""

# Test importmap
echo "Testing importmap..."
if curl -s http://localhost:8080/importmap.json | grep -q "production"; then
    echo "✅ Import map is accessible"
    
    # Show production imports
    echo ""
    echo "📦 Production imports:"
    curl -s http://localhost:8080/importmap.json | \
        python3 -c "import sys, json; data=json.load(sys.stdin); [print(f'   {k}: {v}') for k,v in data['production']['imports'].items() if 'single-spa' in k or 'root-config' in k]"
else
    echo "❌ Import map not found"
    exit 1
fi

echo ""
echo "🎉 All tests passed!"
echo "🌐 Open http://localhost:8080 in your browser"
