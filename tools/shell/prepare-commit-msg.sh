#!/bin/sh

MESSAGE_FILE=.git/COMMIT_EDITMSG
BRANCH_NAME=$(git symbolic-ref --short HEAD)
BRANCH_IN_COMMIT=0

if [ -f $MESSAGE_FILE ]; then
    BRANCH_IN_COMMIT=$(grep -c "\[$BRANCH_NAME\]" $MESSAGE_FILE)
fi

if [ -n "$BRANCH_NAME" ] && ! [[ $BRANCH_IN_COMMIT -ge 1 ]]; then
  if [ -f $MESSAGE_FILE ]; then
    BRANCH_NAME="${BRANCH_NAME/\//\/}"
    sed -i.bak -e "1s@^@[$BRANCH_NAME] @" $MESSAGE_FILE
  else
    echo "[$BRANCH_NAME] " > $MESSAGE_FILE
  fi
fi

exit 0