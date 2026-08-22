# kodekollab

## Local setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to a PostgreSQL database and `BETTER_AUTH_SECRET` to a long random value.
2. Install dependencies with `npm install`.
3. Create the tables and generate Prisma with `npm run db:push`.
4. Run the app with `npm run dev` and the collaboration server with `npm run server:dev`.

Accounts use Better Auth email/password authentication. A room accepts at most five concurrent authenticated Socket.IO connections; participant names are broadcast to everyone in that room.
