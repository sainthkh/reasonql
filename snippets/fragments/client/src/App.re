type queryStatus = 
  | Loading
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
    posts @singular(name: "post") {
      ...PostFragment_post
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
    <>
      <h1> { ReasonReact.string("Awesome Movie Review Blog") } </h1>
      <div> 
      {
        switch(self.state.status) {
        | Loading => { ReasonReact.string("Loading") }
        | Data => { 
          let data = Belt.Option.getExn(self.state.data);
          
          switch(data.posts->Array.length) {
          | 0 => { ReasonReact.string("no posts here.") }
          | _ => data.posts |> Array.mapi((i, post:AppQuery.post) => {
            <Post key=string_of_int(i) post=post.f_post />
          }) |> ReasonReact.array
          }
        }
        }
      }
      </div>
    </>
  }
}
