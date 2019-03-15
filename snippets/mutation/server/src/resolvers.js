module.exports = {
  Query: {
    tweets(_, __, { dataSources }) {
      return dataSources.tweetAPI.getTweets();
    },
  },
  Mutation: {
    saveTweet(_, { tweet }, { dataSources }) {
      dataSources.tweetAPI.save(tweet.text);
      return {}
    },
  }
}