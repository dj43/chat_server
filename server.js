const { ApolloServer, gql } = require("apollo-server");
const mongoose = require("mongoose");

const typeDefs = require("./graphql/typeDefs");

const resolvers = require("./graphql/resolvers");

const contextMiddleware = require("./util/contextMiddleware");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: contextMiddleware,
});

mongoose.set("useCreateIndex", true);

mongoose
  .connect(
    "mongodb+srv://dj:1234@cluster0.15liu.mongodb.net/chat?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then((result) => {
    server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
      console.log(`🚀  Server ready at ${url}`);
    });
  })

  .catch((err) => {
    console.log(err);
  });
