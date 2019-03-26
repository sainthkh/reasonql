const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const app = express();

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());


// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

const apollo = new ApolloServer({
  typeDefs,
  resolvers,
});
// Routes
apollo.applyMiddleware({ 
  app, 
  path: '/graphql',
})

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Server up and running on port ${port} !`));
