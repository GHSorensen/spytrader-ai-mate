
#!/bin/bash

# Automatic backup and recovery script for spy-trader
# This should be run via cron job on a secure server or CI/CD pipeline

set -e  # Exit on error
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/spy-trader"
DB_NAME="sklwsxgxsqtwlqjhegms"
LOG_FILE="${BACKUP_DIR}/backup_log.txt"

# Make sure backup directory exists
mkdir -p ${BACKUP_DIR}

log() {
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1" | tee -a ${LOG_FILE}
}

# Ensure required env variables are set
if [ -z "${SUPABASE_SERVICE_ROLE_KEY}" ]; then
  log "ERROR: SUPABASE_SERVICE_ROLE_KEY is not set"
  exit 1
fi

if [ -z "${SUPABASE_URL}" ]; then
  log "ERROR: SUPABASE_URL is not set"
  exit 1
fi

# Start backup process
log "Starting backup process for spy-trader"

# 1. Create database backup using Supabase SDK and API
log "Creating database backup..."
DB_BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql"

# This is an example using supabase-js with Node.js
# You would need to create a small Node.js script that uses the Supabase API
# to perform a database backup
node <<EOF
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function backupDatabase() {
  try {
    // This is a hypothetical method - actual implementation would depend
    // on Supabase's backup capabilities or direct PostgreSQL access
    const { data, error } = await supabase.rpc('backup_database');
    
    if (error) throw error;
    
    fs.writeFileSync("${DB_BACKUP_FILE}", JSON.stringify(data, null, 2));
    console.log("Database backup successful");
  } catch (error) {
    console.error("Backup failed:", error);
    process.exit(1);
  }
}

backupDatabase();
EOF

# 2. Backup environment configuration
log "Backing up environment configuration..."
ENV_BACKUP_FILE="${BACKUP_DIR}/env_backup_${TIMESTAMP}.json"

# Get environment variables from Render
# This is hypothetical and would need to be implemented with Render's API
# or by securely storing environment variables elsewhere
curl -s -H "Authorization: Bearer ${RENDER_API_KEY}" \
  "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/env-vars" \
  > ${ENV_BACKUP_FILE}

# 3. Create application state backup
log "Backing up application state..."
STATE_BACKUP_DIR="${BACKUP_DIR}/state_${TIMESTAMP}"
mkdir -p ${STATE_BACKUP_DIR}

# Back up any persistent state not in the database
# This could include file uploads, logs, etc.
# cp -r /path/to/state/* ${STATE_BACKUP_DIR}

# 4. Compress backup
log "Compressing backup..."
FINAL_BACKUP="${BACKUP_DIR}/spy-trader-backup-${TIMESTAMP}.tar.gz"
tar -czf ${FINAL_BACKUP} \
  ${DB_BACKUP_FILE} \
  ${ENV_BACKUP_FILE} \
  ${STATE_BACKUP_DIR}

# 5. Encrypt backup (optional but recommended for sensitive data)
log "Encrypting backup..."
ENCRYPTED_BACKUP="${FINAL_BACKUP}.enc"
openssl enc -aes-256-cbc -salt -in ${FINAL_BACKUP} -out ${ENCRYPTED_BACKUP} -k ${BACKUP_ENCRYPTION_KEY}

# 6. Upload to secure storage (e.g., AWS S3, Google Cloud Storage)
log "Uploading backup to secure storage..."
# Example with AWS S3
aws s3 cp ${ENCRYPTED_BACKUP} s3://spy-trader-backups/

# 7. Clean up local files
log "Cleaning up local backup files..."
rm ${DB_BACKUP_FILE}
rm ${ENV_BACKUP_FILE}
rm -rf ${STATE_BACKUP_DIR}
rm ${FINAL_BACKUP}
# Keep the encrypted backup for a few days
find ${BACKUP_DIR} -name "*.enc" -mtime +7 -delete

# 8. Perform backup retention management
log "Managing backup retention..."
# Delete backups older than 30 days from S3
aws s3 ls s3://spy-trader-backups/ --recursive | grep "spy-trader-backup-" | awk '{print $4}' | while read -r file; do
  timestamp=$(echo $file | grep -o "[0-9]\{8\}_[0-9]\{6\}")
  file_date=$(echo $timestamp | cut -d'_' -f1)
  today=$(date +"%Y%m%d")
  
  # Calculate days between file_date and today (simplified)
  days_diff=$(( ( $(date -d "$today" +%s) - $(date -d "$file_date" +%s) ) / 86400 ))
  
  if [ $days_diff -gt 30 ]; then
    log "Deleting old backup: $file"
    aws s3 rm "s3://spy-trader-backups/$file"
  fi
done

# 9. Test backup restoration (optional but recommended periodically)
# This would be run on a schedule, not every backup
if [ "$(date +%u)" = "7" ]; then  # Sunday
  log "Testing backup restoration..."
  # Implementation would depend on your infrastructure
fi

log "Backup process completed successfully!"

# Recovery instructions (commented out, only for reference)
: '
To restore from backup:

1. Download the latest backup from S3:
   aws s3 cp s3://spy-trader-backups/latest-backup.tar.gz.enc ./backup.tar.gz.enc

2. Decrypt the backup:
   openssl enc -aes-256-cbc -d -in backup.tar.gz.enc -out backup.tar.gz -k ${BACKUP_ENCRYPTION_KEY}

3. Extract the backup:
   tar -xzf backup.tar.gz

4. Restore the database:
   # Using Supabase or PostgreSQL tools to restore

5. Restore environment variables:
   # Using Render API or manual configuration

6. Restore application state if necessary:
   # cp -r state_backup/* /path/to/state/

7. Restart the application:
   # Using Render dashboard or API
'

exit 0
