type queryStatus = 
  | Loading
  | Error
  | Data

type state = {
  status: queryStatus,
  data: option(AppQuery.document),
}

type action = 
  | Fetched(AppQuery.document)

let component = ReasonReact.reducerComponent("App");

let query = ReasonQL.gql({|
  query AppQuery {
    hello {
      message
    }
  }
|})

module Request = ReasonQL.MakeRequest(AppQuery);

let make = (_children) => {
  ...component,
  initialState: () => {
    status: Loading,
    data: None,
  },

  didMount: self => {
    Request.send()
    ->Request.finished(data => {
      self.send(Fetched(data));
    })
  },

  reducer: (action, state) => {
    switch(action) {
    | Fetched(response) => ReasonReact.Update({ status: Data, data: response.data })
    }
  },

  render: self => {
    let data = Belt.Option.getExn(self.state.data);

    switch(self.state.status) {
    | Loading => { ReasonReact.string("Loading") }
    | Error => { ReasonReact.string("Error") }
    | Data => { ReasonReact.string(data.hello.message) }
    }
  }
}
