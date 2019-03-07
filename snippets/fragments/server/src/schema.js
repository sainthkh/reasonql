const { gql } = require('apollo-server');

const typeDefs = gql`
type Post {
  id: ID!
  slug: String!
  title: String!
  summary: String!
}

type Query {
  posts: [Post!]
}
`

module.exports = typeDefs;