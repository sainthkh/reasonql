open Types;

let component = ReasonReact.statelessComponent("App");

let make = (_children) => {
  ...component,

  render: _self => {
    let tweets: array(tweet) = [|
      { text: "Let's make ReasonML and GraphQL great!" },
      { text: "Hello, mini-twitter world!" },
    |];
    
    <>
      <h1>{ ReasonReact.string("Mini Twitter"); }</h1>
      <Form />
      <hr />
      {
        tweets 
        |> Array.mapi((i, tweet: tweet) => {
          <Tweet key=string_of_int(i) tweet=tweet />
        }) 
        |> ReasonReact.array
      }
    </>
  }
}
/*
type tweet = {
  text: string,
}

type state = {
  tweets: array(tweet),
};

type action = 
  | InitialLoad(AppQuery.queryResult)
  | TweetDone(TweetMutation.mutationResult)
  ;


let component = ReasonReact.reducerComponent("");

let make = (_children) => {
  ...component,
  initialState: () => {
    tweets: [||],
  },

  reducer: (action: action, _state: state) => {
    switch(action) {
    | InitialLoad(result) => ReasonReact.Update()
    | TweetDone(result) => 
    }
  },

  render: _self => {
    <div>
      
    </div>
  }
}
*/