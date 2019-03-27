type page = 
  | Index
  | Login

type state = {
  page: page,
  token: option(string),
}

type action = 
  | ChangePage(page)
  | SetToken(string)
  | ClearToken
  ;

let urlToPage: list(string) => page = path => 
  switch(path) {
  | [] | [""] | ["/"] => Index
  | ["login"] => Login
  | _ => Index /* It is not recommend in production. Redirect to 404 page. */
  }

let component = ReasonReact.reducerComponent("App");

let make = (_children) => {
  ...component,
  initialState: () => {
    let initialUrl = ReasonReact.Router.dangerouslyGetInitialUrl();
    {
      page: urlToPage(initialUrl.path),
      token: None,
    }
  },

  didMount: self => {
    let watchID = ReasonReact.Router.watchUrl(url => {
      self.send(ChangePage(urlToPage(url.path)));
    });
    
    self.onUnmount(() => ReasonReact.Router.unwatchUrl(watchID));
  },

  reducer: (action, state) => {
    switch(action) {
    | ChangePage(page) => ReasonReact.Update({ ...state, page: page })
    | SetToken(token) => ReasonReact.Update({ ...state, token: Some(token) })
    | ClearToken => ReasonReact.Update({ ...state, token: None })
    }
  },

  render: self => {
    let login = token => {
      self.send(SetToken(token))
    };
    let logout = () => {
      self.send(ClearToken)
    };

    switch(self.state.page) {
    | Index => 
      <IndexPage 
        token=self.state.token
        loggedIn=Belt.Option.isSome(self.state.token)
        logout
      />
    | Login => <LoginPage login />
    }
  }
}
