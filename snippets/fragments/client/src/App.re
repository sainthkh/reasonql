type queryStatus = 
  | Loading
  | Error
  | Data

type state = {
  status: queryStatus,
  data: option(AppQuery.schemaQueryResponse),
}

type action = 
  | Fetched(AppQuery.schemaQueryResponse)

let component = ReasonReact.reducerComponent("App");

let query = ReasonQL.gql({|
  query AppQuery {
    hello {
      message
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
    data: None,
  },

  didMount: self => {
    Request.send(Js.Dict.empty())
    ->Request.finished(data => {
      self.send(Fetched(data));
    })
  },

  reducer: (action, _state) => {
    switch(action) {
    | Fetched(data) => ReasonReact.Update({ status: Data, data: Some(data) })
    }
  },

  render: self => {
    switch(self.state.status) {
    | Loading => { ReasonReact.string("Loading") }
    | Error => { ReasonReact.string("Error") }
    | Data => { 
      let data = Belt.Option.getExn(self.state.data);
      
      switch(data.hello) {
      | Some(hello) => { ReasonReact.string(hello.message) }
      | None => { ReasonReact.string("message not found") }
      }
    }
    }
  }
}
