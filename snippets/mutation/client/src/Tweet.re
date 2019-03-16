open Types;

let component = ReasonReact.statelessComponent("Tweet");

let make = (
  ~tweet: tweet, 
  _children
) => {
  ...component,

  render: _self => {
    <p>
      <span>{ ReasonReact.string(tweet.text) }</span>
      {switch(tweet.status) {
      | Loaded => ReasonReact.null
      | Waiting => <span>{ ReasonReact.string(" << Waiting for response.") }</span>
      }}
    </p>
  }
}
