let component = ReasonReact.statelessComponent("Post")

let make = (
  ~response: PostFragment.response,
  _children
) => {
  ...component,

  render: _self => {
    let post = response.post;

    <div>
      <h2><a href={"/" ++ post.slug}>{ ReasonReact.string(post.title) }</a></h2>
      <p>{ ReasonReact.string(post.summary) }</p>
      <Button response={ post: post } />
    </div>
  }
}
