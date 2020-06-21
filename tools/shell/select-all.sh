#!/bin/sh

. 'shell.env'

echo "exec select_all.sql   =============================================================="
psql -h "$DB_HOST" -f ./sql/select_all.sql
echo "done                  =============================================================="