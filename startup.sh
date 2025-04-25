#!/bin/sh

# Ensure node_modules is installed
if [ ! -d "node_modules" ]; then
  npm install
fi

if [ "$NODE_ENV" = "production" ]; then
  npm run schedule:run &
  npm start
fi

if [ "$NODE_ENV" = "development" ]; then
  npx prisma migrate dev
  npm run schedule:run &
  npm run dev
fi