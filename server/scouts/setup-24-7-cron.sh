#!/bin/bash

# Setup 24/7 Multi-Platform Scout
# Runs every 6 hours (4 times per day) = 32 DJs per run = 128 DJs/day total

echo "Setting up 24/7 Multi-Platform Scout..."

# Create log directory
mkdir -p /home/ubuntu/onlydjs/logs

# Add cron jobs (runs at 12 AM, 6 AM, 12 PM, 6 PM)
CRON_JOBS="
0 0,6,12,18 * * * cd /home/ubuntu/onlydjs && npx tsx server/scouts/multi-platform-scout.ts >> logs/scout-24-7.log 2>&1
"

# Remove old scout jobs and add new ones
(crontab -l 2>/dev/null | grep -v "scout"; echo "$CRON_JOBS") | crontab -

echo "✅ 24/7 Scout installed!"
echo "📅 Runs every 6 hours: 12 AM, 6 AM, 12 PM, 6 PM"
echo "🎯 Target: 32 DJs per run = 128 DJs/day"
echo "📝 Logs: /home/ubuntu/onlydjs/logs/scout-24-7.log"
echo ""
echo "To view cron jobs:"
echo "  crontab -l"
echo ""
echo "To manually run:"
echo "  cd /home/ubuntu/onlydjs && npx tsx server/scouts/multi-platform-scout.ts"
echo ""
echo "To view logs:"
echo "  tail -f /home/ubuntu/onlydjs/logs/scout-24-7.log"
