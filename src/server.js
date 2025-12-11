import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServer } from '@apollo/server';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './schema/resolvers.js';
import { connectDB, getRepository } from './db.js';
import { authContext } from './auth/jwt.js';
import loaders from './dataloaders/index.js';

const PORT = process.env.PORT || 3003;

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Attempt Mongo connection, or fall back to in-memory repository
  const { connected, repo } = await connectDB();
  const repository = repo || (await getRepository());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => ({
        auth: authContext(req),
        repo: repository,
        loaders: loaders(repository),
      }),
    })
  );

  app.get('/', (req, res) => {
    res.send({ status: 'ok', graphql: '/graphql', db: connected ? 'mongo' : 'memory' });
  });

  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});