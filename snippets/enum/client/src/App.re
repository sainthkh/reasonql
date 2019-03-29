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
  query AppQuery($size: PatchSize) {
    planet {
      imageSize
    }
    mission(size: $size) {
      missionPatch(size: $size)
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
    Request.send({
      size: Some(Medium),
    })
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
      
      <>
        <p>
        {switch(data.planet.imageSize) {
        | Small => ReasonReact.string("Small")
        | Medium => ReasonReact.string("Medium")
        | Large => ReasonReact.string("Large")
        | ExtraLarge => ReasonReact.string("ExtraLarge")
        }}
        </p>
        <p>{ReasonReact.string(data.mission.missionPatch)}</p>
      </>
    }
    }
  }
}
