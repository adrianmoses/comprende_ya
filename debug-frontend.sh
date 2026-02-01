#!/bin/bash
# Diagnostic script for frontend container

echo "=== Container Status ==="
sudo docker compose ps

echo -e "\n=== Frontend Container Logs (last 100 lines) ==="
sudo docker compose logs frontend --tail 100

echo -e "\n=== Check if port 3000 is listening ==="
sudo netstat -tlnp | grep :3000 || sudo ss -tlnp | grep :3000

echo -e "\n=== Frontend Container Inspect ==="
sudo docker inspect comprende_ya_frontend --format='{{.State.Status}}: {{.State.Error}}'

echo -e "\n=== Try to curl frontend from host ==="
curl -v http://localhost:3000 2>&1 | head -20
