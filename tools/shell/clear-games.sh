#!/bin/sh

. 'shell.env'

echo "exec clear_games.sql   =============================================================="
psql -h "$DB_HOST" -f ./sql/clear_games.sql
echo "done                   =============================================================="