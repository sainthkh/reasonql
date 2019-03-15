class TweetApi {
  constructor() {
    this.tweets = [
      {
        text: "Let's make ReasonML and GraphQL great!",
      },
      {
        text: "Hello, mini-twitter world!",
      },
    ]
  }

  async getTweets() {
    return this.tweets;
  }

  async save(text) {
    let tweet = {
      text,
    }
    this.tweets.unshift(tweet);
    return tweet;
  }
}

module.exports = TweetApi;