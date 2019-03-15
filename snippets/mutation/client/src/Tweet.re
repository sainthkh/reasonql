open Types;

let component = ReasonReact.statelessComponent("Tweet");

let make = (
  ~tweet: tweet, 
  _children
) => {
  ...component,

  render: _self => {
    <p>{ ReasonReact.string(tweet.text) }</p>
  }
}
