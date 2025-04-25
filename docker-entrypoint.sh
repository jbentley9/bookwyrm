#!/bin/sh

# Run migrations and seed db before starting dev server
echo "Running Prisma Migrate..."
npx prisma migrate deploy

echo "Seeding the database..."
npx prisma db seed

echo "Starting the app..."
npm run dev
