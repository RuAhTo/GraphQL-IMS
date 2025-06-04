import express from "express";
import mongoose from "mongoose";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import { typeDefs } from "./products/products.types.js";
import { productResolvers } from "./products/products.resolver.js";

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp');
console.log('Connected to MongoDB');

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers: productResolvers,
});

await server.start();

app.use(cors());
app.use(express.json());

// app.use('/graphql', expressMiddleware(server, {
//   context: async ({ req }) => ({ req }),
// }));

app.get("/", (req, res) => {
  res.send("GraphQL Server is running! Visit /graphql for GraphQL playground");
});

app.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
});