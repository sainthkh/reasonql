const { gql } = require('apollo-server');

const typeDefs = gql`
schema {
  query: Query
}

scalar uuid
scalar timestamptz

type accounts {
  id: uuid!
  name: String
  timezone: String!
  updated_at: timestamptz!
}

type Query {
  accounts: [accounts!]!
}
`

module.exports = typeDefs;