rm -r -f node_modules/
echo "> removed node modules..."
sleep 1
rm -f package-lock.json
echo "> removed package-lock.json..."
sleep 1
rm -f swagger_output.json
echo "> removed swagger_output.json..."
sleep 1
rm -r -f coverage/
echo "> removed coverage folder..."
sleep 1
rm -r -f .serverless/
echo "> removed serverless folder..."
sleep 1

exit 0