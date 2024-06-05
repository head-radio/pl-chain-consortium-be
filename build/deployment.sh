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