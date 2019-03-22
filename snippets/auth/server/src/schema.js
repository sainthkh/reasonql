const { gql } = require('apollo-server');

const typeDefs = gql`
type Greeting {
    id: ID!
    message: String!
}

type Query {
    hello(time: String): Greeting
}
`

module.exports = typeDefs;