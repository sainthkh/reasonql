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
  | OptimisticPrepend(Types.tweet)
  | Prepend(SaveTweetMutation.queryResult)
  ;

let component = ReasonReact.reducerComponent("App");

let query = ReasonQL.gql({|
  query AppQuery {
    tweets @singular(name: "tweet") {
      id
      text
    }
  }
|})

let saveTweet = ReasonQL.gql({|
  mutation SaveTweetMutation($tweet: TweetInput) {
    saveTweet(tweet: $tweet) {
      success
      id
      tempId
      text
    }
  }
|})

module Client = {
  let url = "http://localhost:4000";
};

module Request = ReasonQL.MakeRequest(AppQuery, Client);
module SaveTweet = ReasonQL.MakeRequest(SaveTweetMutation, Client);

let id = ref(0);
let newId = () => {
  id := id^ + 1;
  "tempId-" ++ string_of_int(id^);
}

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
          id: t.id,
          text: t.text,
          status: Types.Loaded,
        }: Types.tweet)), 
      });
    | OptimisticPrepend(tweet) => 
      ReasonReact.UpdateWithSideEffects({ 
        ...state, 
        tweets: 
          Array.append([|tweet|], state.tweets)
      }, self => {
        SaveTweet.send({
          tweet: {
            text: tweet.text,
            tempId: tweet.id,
          }
        })
        ->SaveTweet.finished(data => {
          self.send(Prepend(data))
        })
      });
    | Prepend(data) => 
      ReasonReact.Update({
        ...state,
        tweets: 
          state.tweets |> Array.map(t => {
            switch(t) {
            | v when v.id == data.saveTweet.tempId => {
              id: t.id,
              text: t.text,
              status: Types.Loaded,
            }
            | _ => t
            }
          })
      })
    }
  },

  render: self => {
    let onSubmit = (text:string) => {
      self.send(OptimisticPrepend({
        id: newId(),
        text: text,
        status: Types.Waiting,
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
