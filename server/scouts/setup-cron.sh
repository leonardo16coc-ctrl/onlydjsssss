#!/bin/bash

# Setup Daily Scout Cron Job
# Runs every day at a random time between 2-4 AM to avoid patterns

echo "Setting up Daily Scout cron job..."

# Create log directory
mkdir -p /home/ubuntu/onlydjs/logs

# Add cron job (runs at 3 AM every day)
CRON_JOB="0 3 * * * cd /home/ubuntu/onlydjs && npx tsx server/scouts/daily-scout-puppeteer.ts >> logs/scout.log 2>&1"

# Check if cron job already exists
(crontab -l 2>/dev/null | grep -v "daily-scout-puppeteer"; echo "$CRON_JOB") | crontab -

echo "✅ Cron job installed!"
echo "📅 Scout will run daily at 3:00 AM"
echo "📝 Logs: /home/ubuntu/onlydjs/logs/scout.log"
echo ""
echo "To view current cron jobs:"
echo "  crontab -l"
echo ""
echo "To manually run the scout:"
echo "  cd /home/ubuntu/onlydjs && npx tsx server/scouts/daily-scout-puppeteer.ts"
