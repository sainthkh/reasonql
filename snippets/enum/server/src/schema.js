const { gql } = require('apollo-server');

const typeDefs = gql`
enum PatchSize {
  SMALL
  MEDIUM
  LARGE
  EXTRA_LARGE
}

type Mission {
  name: String!
  missionPatch(size: PatchSize): String!
}

type Planet {
  name: String!
  imageSize: PatchSize!
}

type Query {
  planet: Planet!
  mission(size: PatchSize): Mission!
}
`

module.exports = typeDefs;