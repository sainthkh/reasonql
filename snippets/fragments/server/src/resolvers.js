module.exports = {
  Query: {
    posts: function(_, _, _) {
      return [
        {
          id: "1",
          slug: "iron-man",
          title: "Iron Man(2008) Review",
          summary: "Great Beginning of Marvel Cinematic Universe",
        },
        {
          id: "2",
          slug: "captain-america",
          title: "Captain America: First Avenger Review",
          summary: "I love you. Captain!",
        },
        {
          id: "3",
          slug: "avengers",
          title: "Avengers Review",
          summary: "Is New York OK?",
        }
      ];
    },
  }
}