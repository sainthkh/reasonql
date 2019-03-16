let id = 0;
function newID() {
  return ++id;
}

// TweetApi cleass is created every time when called.
// So, we need to take it out from it.
let tweets = [
  {
    id: newID(),
    text: "Let's make ReasonML and GraphQL great!",
  },
  {
    id: newID(),
    text: "Hello, mini-twitter world!",
  },
];

class TweetApi {
  async getTweets() {
    return tweets;
  }

  async save({text, tempId}) {
    let tweet = {
      id: newID(),
      text,
    }
    tweets.unshift(tweet);
    return {
      ...tweet,
      success: true,
      tempId,
    };
  }
}

module.exports = TweetApi;