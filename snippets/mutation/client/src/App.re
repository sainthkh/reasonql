open Types;

type status = 
  | Loading
  | Data

type state = {
  status: status,
  tweets: array(tweet),
};

type action = 
  | InitialLoad(AppQuery.queryResult)
  | AppendTweet(Types.tweet)
  ;

let component = ReasonReact.reducerComponent("App");

let query = ReasonQL.gql({|
  query AppQuery {
    tweets @singular(name: "tweet") {
      text
    }
  }
|})

module Request = ReasonQL.MakeRequest(AppQuery, {
  let url = "http://localhost:4000";
});

let make = (_children) => {
  ...component,
  initialState: () => {
    status: Loading,
    tweets: [||],
  },

  didMount: self => {
    Request.send(Js.Dict.empty())
    ->Request.finished(data => {
      self.send(InitialLoad(data));
    })
  },

  reducer: (action: action, state: state) => {
    switch(action) {
    | InitialLoad(data) =>
      ReasonReact.Update({ 
        status: Data, 
        tweets: data.tweets |> Array.map((t: AppQuery.tweet) => ({
          text: t.text,
        }: Types.tweet)), 
      });
    | AppendTweet(tweet) => ReasonReact.Update({ ...state, tweets: Array.append([|tweet|], state.tweets)});
    }
  },

  render: self => {
    let onSubmit = (text:string) => {
      self.send(AppendTweet({
        text: text,
      }))
    };

    <>
      <h1>{ ReasonReact.string("Mini Twitter"); }</h1>
      <Form onSubmit />
      <hr />
      {switch(self.state.status){
      | Loading => ReasonReact.string("Loading tweets...");
      | Data => self.state.tweets 
        |> Array.mapi((i, tweet: tweet) => {
          <Tweet key=string_of_int(i) tweet=tweet />
        }) 
        |> ReasonReact.array
      }}
    </>
  }
}
