const { gql } = require('apollo-server');

const typeDefs = gql`
type Content {
  id: ID!
  common: String!
  premium: String!
}

type Query {
  content(token: String): Content!
}

type Mutation {
  login(email: String!, password: String!): String
}
`

module.exports = typeDefs;