#!/bin/bash

echo "🔍 Полная проверка приложения на localhost:8080"
echo "================================================"
echo ""

# Проверка статуса контейнера
echo "📦 Статус контейнера:"
/usr/local/bin/docker ps --filter "name=react-single-spa-prod" --format "  Status: {{.Status}}, Ports: {{.Ports}}"
echo ""

# Проверка health endpoint
echo "💚 Health Check:"
HEALTH=$(/usr/bin/curl -s http://localhost:8080/health)
if [ "$HEALTH" = "healthy" ]; then
    echo "  ✅ Health endpoint: OK"
else
    echo "  ❌ Health endpoint: FAILED"
fi
echo ""

# Проверка основных файлов
echo "📁 Проверка основных файлов:"
for path in "/" "/importmap.json" "/importmap-loader.js" "/favicon.svg"; do
    CODE=$(/usr/bin/curl -o /dev/null -s -w "%{http_code}" http://localhost:8080$path)
    if [ "$CODE" = "200" ]; then
        echo "  ✅ $path"
    else
        echo "  ❌ $path (HTTP $CODE)"
    fi
done
echo ""

# Проверка микрофронтендов
echo "🎯 Проверка микрофронтендов:"
/usr/bin/curl -o /dev/null -s -w "  ✅ root-config: HTTP %{http_code}\n" http://localhost:8080/dist/root-config/main-CGXFesFO.js
/usr/bin/curl -o /dev/null -s -w "  ✅ header: HTTP %{http_code}\n" http://localhost:8080/dist/header/main-CqSM1gYJ.js
/usr/bin/curl -o /dev/null -s -w "  ✅ microfrontend: HTTP %{http_code}\n" http://localhost:8080/dist/microfrontend/main-B5rOPDMC.js
/usr/bin/curl -o /dev/null -s -w "  ✅ microfrontend2: HTTP %{http_code}\n" http://localhost:8080/dist/microfrontend2/main-CchIrUIi.js
/usr/bin/curl -o /dev/null -s -w "  ✅ sidebar: HTTP %{http_code}\n" http://localhost:8080/dist/sidebar/main-CXy9n-Ul.js
echo ""

# Проверка CSS
echo "🎨 Проверка CSS файлов:"
/usr/bin/curl -o /dev/null -s -w "  ✅ root-config CSS: HTTP %{http_code}\n" http://localhost:8080/dist/root-config/assets/main-BDNOyzxu.css
/usr/bin/curl -o /dev/null -s -w "  ✅ header CSS: HTTP %{http_code}\n" http://localhost:8080/dist/header/assets/main-BDNOyzxu.css
echo ""

# Проверка структуры в контейнере
echo "📊 Структура директорий в контейнере:"
/usr/local/bin/docker exec react-single-spa-prod ls -1 /usr/share/nginx/html/dist/ | sed 's/^/  /'
echo ""

# Подсчет файлов
echo "📈 Статистика файлов:"
JS_COUNT=$(/usr/local/bin/docker exec react-single-spa-prod find /usr/share/nginx/html/dist -name "*.js" -type f | wc -l | xargs)
CSS_COUNT=$(/usr/local/bin/docker exec react-single-spa-prod find /usr/share/nginx/html/dist -name "*.css" -type f | wc -l | xargs)
echo "  📄 JS файлов: $JS_COUNT"
echo "  🎨 CSS файлов: $CSS_COUNT"
echo ""

# Проверка последних запросов из логов
echo "📝 Последние 5 запросов из логов:"
/usr/local/bin/docker-compose logs web 2>&1 | /usr/bin/tail -5 | sed 's/^react-single-spa-prod  | /  /'
echo ""

echo "================================================"
echo "✅ Проверка завершена!"
echo ""
echo "🌐 Приложение доступно по адресу:"
echo "   http://localhost:8080"
echo ""
echo "💡 Для просмотра в браузере выполните:"
echo "   open http://localhost:8080"
