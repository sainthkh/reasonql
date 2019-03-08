let query = ReasonQL.gql({|
  fragment ButtonFragment_post on Post {
    slug
  }
|})

let component = ReasonReact.statelessComponent("Button")

let make = (
  ~response: ButtonFragment.response,
  _children
) => {
  ...component,

  render: _self => {
    <a href={j|/$response.post.slug|j}>{ ReasonReact.string("Read More") }</a>
  }
}
