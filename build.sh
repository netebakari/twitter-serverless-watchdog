#!/bin/sh

if [ -e twitter-serverless-watchdog.zip ]; then
   rm twitter-serverless-watchdog.zip
fi

if [ -e node_modules ]; then
   rm -rf node_modules
fi

if [ -e dist ]; then
   rm -rf dist
fi
npm install
npx tsc
rm -rf node_modules
npm install --production
rm -rf dist/src/cli
cd dist/src
zip ../../twitter-serverless-watchdog.zip -r *
cd ../..
zip twitter-serverless-watchdog.zip -r node_modules/
npm install
