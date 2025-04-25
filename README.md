# BookWyrm

A book review management system built with React Router v7 Framework and PostgreSQL.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/)*
- [Git](https://git-scm.com/downloads)

*If running in Windows, you may need to run:
   ```bash
    wsl --update
   ```

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/jbentley9/bookwyrm.git
   cd bookwyrm
   ```

2. Start the application with Docker:
   ```bash
   docker compose up --build
   ```

   - Database is seeded automatically during container startup. 

3. Once the containers are running and the database is seeded, go to this URL in your browser:
   ```
   http://localhost:5173
   ```

The application should now be running with a seeded PostgreSQL database.

## Manual Setup (Without Docker)

If you prefer to run the application without Docker:

1. Install dependencies:
   - Node.js 18 or later
   - PostgreSQL 16 or later

2. Clone the repository:
   ```bash
   git clone https://github.com/jbentley9/bookwyrm.git
   cd bookwyrm
   ```

3. Install npm packages:
   ```bash
   npm install
   ```

4. Set up your database:
   ```bash
   # Create a PostgreSQL database named 'bookwyrm'
   # Then set your DATABASE_URL in .env:
   DATABASE_URL="postgresql://username:password@localhost:5432/bookwyrm?schema=public"
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

6. Seed the database with sample data:
   ```bash
   npx prisma db seed
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

8. Open your browser and visit:
   ```
   http://localhost:5173
   ```

## Sample Data

When you seed the database, it will create:
- 10 sample users with different tiers (Basic and Premier)
- 10 fantasy/sci-fi books
- 50 random reviews
All users have the password: 'password123'

## Default Login

After setup, you can register an admin account here:
   ```
   http://localhost:5173/login
   ```

## Stopping the Application

If using Docker:
```bash
docker compose down
```

If running manually:
- Press `Ctrl+C` in the terminal running the server
