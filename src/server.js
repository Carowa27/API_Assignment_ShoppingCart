require("dotenv").config();
const { ApolloServer } = require("@apollo/server");
const { resolvers } = require("./resolvers");
const { loadFiles } = require("@graphql-tools/load-files");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { startStandaloneServer } = require("@apollo/server/standalone");
const path = require("path");
const { expressMiddleware } = require("@apollo/server/express4");
const express = require("express");

//start with express
// const app = express();
// app.use(express.json());
// app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(path.join(__dirname, "views")));
// const port = process.env.PORT || 6000;

// async function run() {
//   try {
//     const typeDefs = await loadFiles(path.join(__dirname, "schema.gql"));
//     const schema = makeExecutableSchema({
//       typeDefs: typeDefs,
//       resolvers: resolvers,
//     });
//     const server = new ApolloServer({ schema: schema });
//     await server.start();
//     app.use("/graphql", expressMiddleware(server));
//     app.listen(port, () => {
//       console.log(`Server ready at http://localhost:${port}`);
//     });
//   } catch (error) {
//     console.error(error);
//   }
// }
// run();

//start with standaloneserver
async function run() {
  try {
    const typeDefs = await loadFiles(path.join(__dirname, "schema.gql"));

    const schema = makeExecutableSchema({
      typeDefs: typeDefs,
      resolvers: resolvers,
    });
    const server = new ApolloServer({
      schema: schema,
    });
    const response = await startStandaloneServer(server);
    console.log(`server ready at ${response.url}`);
  } catch (error) {
    console.log(error);
  }
}
run();
