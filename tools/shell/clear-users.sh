#!/bin/sh

. 'shell.env'

echo "exec clear_users.sql   =============================================================="
psql -h "$DB_HOST" -f ./sql/clear_users.sql
echo "done                   =============================================================="