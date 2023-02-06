require("dotenv").config();
const { ApolloServer } = require("@apollo/server");
const { resolvers } = require("./resolvers");
const { loadFiles } = require("@graphql-tools/load-files");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { startStandaloneServer } = require("@apollo/server/standalone");
const path = require("path");

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
