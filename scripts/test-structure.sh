#!/bin/bash

echo "🧪 Testing application structure..."
echo ""

# Test main files
echo "📁 Testing file structure:"
for file in "/" "/importmap.json" "/dist/root-config/main-CGXFesFO.js" "/dist/header/main-CqSM1gYJ.js"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080$file)
    if [ "$status" = "200" ]; then
        echo "✅ $file - OK"
    else
        echo "❌ $file - FAILED (HTTP $status)"
    fi
done

echo ""
echo "📊 Container structure:"
docker exec react-single-spa-prod sh -c "ls -d /usr/share/nginx/html/dist/*/"

echo ""
echo "🎨 CSS files:"
docker exec react-single-spa-prod find /usr/share/nginx/html/dist -name "*.css" | wc -l | xargs echo "Found CSS files:"

echo ""
echo "🌐 Open http://localhost:8080 in your browser to test the application"
echo ""
echo "💡 To view browser console errors, open Developer Tools (F12)"
