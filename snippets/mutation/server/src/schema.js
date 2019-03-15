const { gql } = require('apollo-server');

const typeDefs = gql`
type Tweet {
  text: String!
}

type Query {
  tweets: [Tweet!]!
}

input TweetInput {
  text: String!
}

type TweetResponse {
  sucess: Boolean!
  text: String!
}

type Mutation {
  saveTweet(tweet: TweetInput): TweetResponse!
}
`

module.exports = typeDefs;