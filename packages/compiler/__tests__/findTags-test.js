const {findTags} = require('../src/graphql-to-reason/tagFinder');

describe('Find GraphQL tags', () => {
  it("parses simple file", () => {
    expect(findTags("let a = 3.141592; ")).toEqual([]);
  })

  let queryRenderer = `
open AppQuery;
let component = ReasonReact.statelessComponent("App")

let query = Apollo.gql({|
  query AppQuery {
    hello {
      message
    }
  }
|})

module Query = ReasonRelay.MakeQuery(AppQuery);
let make = (_children) => {
  ...component,

  render: _self => {
    <Query
      query
      render = {(result) => {
        switch(result) {
        | Loading => { ReasonReact.string("Loading...") }
        | Error(messages) => { ReasonReact.string("Error...") }
        | Data(response) => { 
          switch(response.hello) {
          | None => ReasonReact.string("No message") 
          | Some(hello) => ReasonReact.string(hello.message) 
          }
        }
        }
      }}
    />
  }
}
  `.trim();

  it("parses query in Query", () => {
    expect(findTags(queryRenderer)[0].template.trim()).toBe(`
  query AppQuery {
    hello {
      message
    }
  }
    `.trim())
  })

  it("returns correct line and column number", () => {
    let {line, column} = findTags(queryRenderer)[0].sourceLocationOffset;
    expect([line, column]).toEqual([4, 20]);
  })

  it.skip("parses multiple queries in a single file", () => {

  })
})