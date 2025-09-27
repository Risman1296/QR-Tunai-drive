#!/bin/bash
# Script untuk test konektivitas network

echo "=== QR Tunai Drive - Network Test ==="
echo "PC IP WiFi: 192.168.8.103"
echo "Server Port: 3001" 
echo ""
echo "URL untuk testing dari HP:"
echo "  - Home: http://192.168.8.103:3001"
echo "  - QR: http://192.168.8.103:3001/qr"
echo "  - Dashboard: http://192.168.8.103:3001/dashboard"
echo ""
echo "Pastikan HP dan PC dalam jaringan WiFi yang sama (192.168.8.x)"
echo ""
echo "Test connectivity:"
curl -I http://192.168.8.103:3001 2>/dev/null && echo "✅ Server accessible" || echo "❌ Server not accessible"