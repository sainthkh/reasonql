type queryStatus = 
  | Loading
  | Data

type state = {
  status: queryStatus,
  data: option(IndexPageQuery.queryResult),
}

type action = 
  | Load(option(string))
  | Fetched(IndexPageQuery.queryResult)

let component = ReasonReact.reducerComponent("App");

let query = ReasonQL.gql({|
query IndexPageQuery($token: String) {
  content(token: $token) {
    common
    premium
  }
}
|})

module Request = ReasonQL.MakeRequest(IndexPageQuery, {
  let url = "http://localhost:4000/graphql";
});

let make = (
  ~token: option(string),
  ~loggedIn: bool,
  ~logout: unit => unit,
  _children
) => {
  ...component,
  initialState: () => {
    status: Loading,
    data: None,
  },

  didMount: self => {
    self.send(Load(token));
  },

  reducer: (action, _state) => {
    switch(action) {
    | Load(token) => ReasonReact.SideEffects(self => {
      Request.send({ token: token })
      ->Request.finished(data => {
        self.send(Fetched(data));
      })
    })
    | Fetched(data) => ReasonReact.Update({ status: Data, data: Some(data) })
    }
  },

  render: self => {
    <>
      {switch(loggedIn) {
      | false => <Link href="/login">{ ReasonReact.string("Login") }</Link>
      | true => {
        let onClick = event => {
          event->ReactEvent.Synthetic.preventDefault;
          logout();
          self.send(Load(None));
        };

        <a href="#" onClick>{ ReasonReact.string("Log out") }</a>
      }
      }} 
      <div>
        {switch(self.state.status) {
        | Loading => { ReasonReact.string("Loading") }
        | Data => { 
          let data = Belt.Option.getExn(self.state.data);
          
          <>
            <p>{ ReasonReact.string(data.content.common) }</p>
            <p>{ ReasonReact.string(data.content.premium) }</p>
          </>
        }
        }}
      </div>
    </>
  }
}
