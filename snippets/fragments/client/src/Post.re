let query = ReasonQL.gql({|
  fragment PostFragment_post on Post {
    title
    summary
    slug
    ...ButtonFragment_post
  }
|})

let component = ReasonReact.statelessComponent("Post")

let make = (
  ~post: PostFragment.post,
  _children
) => {
  ...component,

  render: _self => {
    <div>
      <h2><a href={"/" ++ post.slug}>{ ReasonReact.string(post.title) }</a></h2>
      <p>{ ReasonReact.string(post.summary) }</p>
      <Button post=post.f_post />
    </div>
  }
}
