module.exports = {
  Query: {
    accounts: function (_, _, _) {
      return [{
        id: "72520fc6-0387-4f71-807d-c22c81c86dfb",
        name: "Me",
        timezone: "UTC+8",
        updated_at: new Date()
      }, {
        id: "5aabe3c1-e1cf-41cf-9659-73a878380b8f",
        name: null,
        timezone: "UTC+8",
        updated_at: new Date()
      },
      ];
    },
  }
}