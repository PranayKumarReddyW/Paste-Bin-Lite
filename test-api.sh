#!/bin/bash

BASE_URL="${1:-http://localhost:3000}"

echo "Testing Pastebin API at $BASE_URL"
echo "========================================"

echo -e "\n1. Testing Health Check..."
HEALTH=$(curl -s "$BASE_URL/api/healthz")
echo "Response: $HEALTH"

if echo "$HEALTH" | grep -q '"ok":true'; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi

echo -e "\n2. Testing Paste Creation..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/pastes" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test paste content","ttl_seconds":3600,"max_views":5}')
echo "Response: $CREATE_RESPONSE"

PASTE_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Paste ID: $PASTE_ID"

if [ -z "$PASTE_ID" ]; then
    echo "❌ Paste creation failed"
    exit 1
fi
echo "✅ Paste created successfully"

echo -e "\n3. Testing Paste Retrieval (API)..."
GET_RESPONSE=$(curl -s "$BASE_URL/api/pastes/$PASTE_ID")
echo "Response: $GET_RESPONSE"

if echo "$GET_RESPONSE" | grep -q "Test paste content"; then
    echo "✅ Paste retrieval passed"
else
    echo "❌ Paste retrieval failed"
    exit 1
fi

echo -e "\n4. Testing Paste View (HTML)..."
HTML_RESPONSE=$(curl -s "$BASE_URL/p/$PASTE_ID")
if echo "$HTML_RESPONSE" | grep -q "Test paste content"; then
    echo "✅ HTML view passed"
else
    echo "❌ HTML view failed"
    exit 1
fi

echo -e "\n5. Testing Invalid Paste..."
INVALID_RESPONSE=$(curl -s -w "%{http_code}" "$BASE_URL/api/pastes/invalid123")
if echo "$INVALID_RESPONSE" | grep -q "404"; then
    echo "✅ Invalid paste returns 404"
else
    echo "❌ Invalid paste test failed"
fi

echo -e "\n6. Testing View Limit..."
CREATE_LIMITED=$(curl -s -X POST "$BASE_URL/api/pastes" \
  -H "Content-Type: application/json" \
  -d '{"content":"Limited views","max_views":2}')
LIMITED_ID=$(echo "$CREATE_LIMITED" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

echo "Created paste with max_views=2: $LIMITED_ID"

curl -s "$BASE_URL/api/pastes/$LIMITED_ID" > /dev/null
echo "First view completed"

curl -s "$BASE_URL/api/pastes/$LIMITED_ID" > /dev/null
echo "Second view completed"

THIRD_VIEW=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/pastes/$LIMITED_ID")
if [ "$THIRD_VIEW" = "404" ]; then
    echo "✅ View limit enforced correctly"
else
    echo "❌ View limit test failed (got $THIRD_VIEW)"
fi

echo -e "\n7. Testing Validation Errors..."
ERROR_RESPONSE=$(curl -s -X POST "$BASE_URL/api/pastes" \
  -H "Content-Type: application/json" \
  -d '{"content":""}')
  
if echo "$ERROR_RESPONSE" | grep -q "error"; then
    echo "✅ Validation error handled correctly"
else
    echo "❌ Validation test failed"
fi

echo -e "\n========================================"
echo "All tests completed!"
