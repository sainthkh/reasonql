module.exports = {
  Query: {
    planet: function(_, _, _) {
      return {
        name: "Mars",
        imageSize: "MEDIUM",
      }
    },
    mission: function(_, { size }, __) {
      return {
        name: "Awesome",
        missionPatch: size == "SMALL" ? "SMALL" : "EXTRA_LARGE",
      }
    },
  }
}