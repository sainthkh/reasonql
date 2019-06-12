module.exports = {
  Query: {
    hello: function(_, _, _) {
      return {
        id: "1234",
        message: "Hello, GraphQL World!"
      };
    },
  }
}