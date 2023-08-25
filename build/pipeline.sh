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
    echo "> Successful test! Start deployment..."

    export NODE_ENV=dev
    echo "> set NODE_ENV variable with $NODE_ENV"

    echo "> sleep for 5 seconds ..."
    sleep 5

    npm run swagger-autogen &
    echo "> created swagger documentation"

    echo "> sleep for 5 seconds ..."
    sleep 5

    echo "> start kill node process ..."
    kill $(pidof node)
    echo "> killed node process ..."

    echo "> sleep 5 seconds.."
    sleep 5

    echo "> start deploy to AWS Lambda"

    serverless deploy

    echo "> end deploy to AWS Lambda"
else
  echo "> Error test. Check your code."
fi

