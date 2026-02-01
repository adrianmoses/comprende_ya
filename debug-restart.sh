#!/bin/bash
# Debug script for restarting container

echo "=== Stop the restart loop ==="
sudo docker compose stop frontend

echo -e "\n=== Get logs from all previous attempts ==="
sudo docker logs comprende_ya_frontend --tail 200

echo -e "\n=== Check container exit code ==="
sudo docker inspect comprende_ya_frontend --format='Exit Code: {{.State.ExitCode}}'

echo -e "\n=== List contents of dist directory in the image ==="
sudo docker run --rm --entrypoint ls comprende_ya-frontend -la /app/dist/ || echo "Could not list dist/"

echo -e "\n=== Try to run the container interactively to see the error ==="
echo "Running: sudo docker run --rm -it --entrypoint sh comprende_ya_frontend"
sudo docker run --rm -it --entrypoint sh comprende_ya-frontend
