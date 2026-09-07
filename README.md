# Electronic Shop

Phase 1 foundation for a MERN e-commerce application.

## Applications

- `client`: React, Vite, TypeScript, Tailwind CSS, React Router, and Axios
- `server`: Node.js, Express, TypeScript, and MongoDB/Mongoose

## Requirements

- Node.js 20 or later
- npm 10 or later
- MongoDB (local or hosted)

## Setup

1. Install all dependencies:

   ```bash
   npm install
   npm install --prefix client
   npm install --prefix server
   ```

2. Copy each environment template and provide real values:

   ```bash
   cp client/.env.example client/.env
   cp server/.env.example server/.env
   ```

3. Start both applications from this directory:

   ```bash
   npm run dev
   ```

The client runs at `http://localhost:5173` and the API at `http://localhost:5000`. The API health check is available at `GET /api/v1/health`.

You can also start each application in a separate terminal:

```bash
npm run dev --prefix client
npm run dev --prefix server
```

The server requires MongoDB to be running and reachable at the `MONGODB_URI`
configured in `server/.env`.

## Source structure

```text
client/src/
  api/          Axios configuration
  pages/        Route-level React components

server/src/
  config/       Environment and database configuration
  controllers/  HTTP request handlers
  middleware/   Express middleware
  routes/       API route definitions
  utils/        Shared server utilities
```

## Scripts

- `npm run dev`: run client and server together
- `npm run build`: build both applications
- `npm run lint`: lint both applications
- `npm run format:check`: verify formatting
