#!/bin/sh

. 'shell.env'

echo "clean           =============================================================="
rm -rf ./tmp/*

echo "create tmp      =============================================================="
mkdir -p "tmp"

echo "create init.sql =============================================================="
cd sql
cat drop_all.sql board_games.sql users.sql reviews.sql posts.sql comments.sql > ../tmp/init.sql
cd ..

echo "exec init.sql   =============================================================="
psql -h "$DB_HOST" -f ./tmp/init.sql
echo "done            =============================================================="