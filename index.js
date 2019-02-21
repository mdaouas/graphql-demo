const { MongoClient } = require('mongodb');
require('dotenv').config();
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const expressPlayground = require('graphql-playground-middleware-express')
  .default;
const { readFileSync } = require('fs');
const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8');
const resolvers = require('./resolvers');
const db = require('./db');
const { createServer } = require('http');

async function start() {
  const app = express();
  const MONGO_DB = process.env.DB_HOST;

  const client = await MongoClient.connect(
    MONGO_DB,
    { useNewUrlParser: true },
  );

  const dbMongo = client.db();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const githubToken = req.headers.authorization;
      const currentUser = await dbMongo
        .collection('users')
        .findOne({ githubToken });
      return { db: dbMongo, currentUser };
    },
  });

  server.applyMiddleware({ app });

  app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'));

  app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

  const httpServer = createServer(app);
  server.installSubscriptionHandlers(httpServer);

  httpServer.listen({ port: 4000 }, () =>
    console.log(
      `GraphQL Server running at localhost:4000${server.graphqlPath}`,
    ),
  );

  // app.listen({ port: 4000 }, () =>
  //   console.log(
  //     `GraphQL Server running @ http://localhost:4000${server.graphqlPath}`,
  //   ),
  // );
}
start();
