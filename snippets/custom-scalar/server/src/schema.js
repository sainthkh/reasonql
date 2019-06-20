const { gql } = require('apollo-server');

const typeDefs = gql`
schema {
  query: query_root
}

scalar uuid
scalar timestamptz

type accounts {
  id: uuid!
  name: String
  timezone: String!
  updated_at: timestamptz!
}

type query_root {
  accounts: [accounts!]!
}
`

module.exports = typeDefs;