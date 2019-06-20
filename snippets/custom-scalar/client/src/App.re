open CustomTypes;

type queryStatus = 
  | Loading
  | Error
  | Data

type state = {
  status: queryStatus,
  data: option(AppQuery.queryResult),
}

type action = 
  | Fetched(AppQuery.queryResult)

let component = ReasonReact.reducerComponent("App");

let query = ReasonQL.gql({|
  query AppQuery {
    accounts {
      id
      name
      updated_at
    }
  }
|})

let set_default = (default: 'a, opt: option('a)) => switch(opt) {
| Some(v) => v
| None => default
};

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
      <div>
      {data.accounts
        |> Array.mapi((i: int, account: AppQuery.accounts) => 
        <div key={i |> string_of_int}>
          <li>{account.id |> uuidToString |> ReasonReact.string}</li>
          <li>{account.name |> set_default("No Name") |> ReasonReact.string}</li>
          <li>{account.updated_at |> Js.Date.toDateString |> ReasonReact.string}</li>
        </div>)
        |> ReasonReact.array}
      </div>
    }
    }
  }
}

