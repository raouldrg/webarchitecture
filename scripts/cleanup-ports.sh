#!/bin/bash

# ECO Impact Tracker - Port Cleanup Script
# Kills zombie processes on ports 5173, 5174, and 8081

echo "🧹 Cleaning up ports..."

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    
    if [ -n "$pid" ]; then
        echo "   Killing process $pid on port $port"
        kill -9 $pid 2>/dev/null
        sleep 0.5
    fi
}

# Clean frontend ports
kill_port 5173
kill_port 5174

# Clean backend port
kill_port 8081

# Verify ports are free
echo ""
echo "✓ Port cleanup complete"
echo ""

# Check if any ports are still occupied
remaining=$(lsof -ti:5173,5174,8081)
if [ -n "$remaining" ]; then
    echo "⚠️  Warning: Some ports are still occupied"
    lsof -i:5173,5174,8081
else
    echo "✓ All ports are free and ready"
fi
