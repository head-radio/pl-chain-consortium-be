#!/bin/bash

echo "> start deploy time"
date +"%H:%M:%S"

## delete folders and files
sh ./build/clear-project.sh
clear_project_exit_code=$?

# download dependencies
echo "> start download dependencies..."
y | npm install y

echo "> sleep for 5 seconds and start test..."
sleep 5

npm run test

# take exit code of execution test
exit_code=$?

echo "> end test and spleep 5 seconds..."
sleep 5

# check variable
if [ $exit_code -eq 0 ]; then
  sh ./build/deployment.sh
else
  echo "> Error test. Check your code."
fi
