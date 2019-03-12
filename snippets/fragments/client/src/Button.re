let query = ReasonQL.gql({|
  fragment ButtonFragment_post on Post {
    slug
  }
|})

let component = ReasonReact.statelessComponent("Button")

let make = (
  ~post: ButtonFragment.post,
  _children
) => {
  ...component,

  render: _self => {
    <a href={j|/$post.slug|j}>{ ReasonReact.string("Read More") }</a>
  }
}
