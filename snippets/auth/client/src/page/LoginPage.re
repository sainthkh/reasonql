type state = {
  email: string,
  password: string,
  errEmail: option(string),
  errPassword: option(string),
};

type action = 
  | ChangeEmail(string)
  | ChangePassword(string)
  | ShowError(option(string), option(string))
  ;

let component = ReasonReact.reducerComponent("LoginPage");

let query = ReasonQL.gql({|
mutation LoginMutation($email: String!, $password: String!) {
  login(email: $email, password: $password)
}
|})

module Login = ReasonQL.MakeRequest(LoginMutation, {
  let url = "http://localhost:4000/graphql";
})

let make = (
  ~login: string => unit, 
  _children
) => {
  ...component,
  initialState: () => {
    email: "",
    password: "",
    errEmail: None,
    errPassword: None,
  },

  reducer: (action: action, state: state) => {
    switch(action) {
    | ChangeEmail(text) => ReasonReact.Update({...state, email: text})
    | ChangePassword(text) => ReasonReact.Update({...state, password: text})
    | ShowError(errEmail, errPassword) => 
      ReasonReact.Update({
        ...state, 
        errEmail: errEmail,
        errPassword: errPassword,
      })
    }
  },

  render: self => {
    let onChangeEmail = event => {
      let v = ReactEvent.Form.target(event)##value;
      self.send(ChangeEmail(v));
    };
    let onChangePassword = event => {
      let v = ReactEvent.Form.target(event)##value;
      self.send(ChangePassword(v));
    };
    let onClick = _ => {
      let { email, password } = self.state;
      Login.send({ email, password })
      ->Login.finishedWithError((result, errors) => {
        switch(errors) {
        | None => {
          login(Belt.Option.getExn(result.login));
          ReasonReact.Router.push("/");
        }
        | Some(errors) => {
          let {email, password}: QueryErrors.loginFormError 
            = QueryErrors.decodeLoginFormError(errors[0].extensions);
          self.send(ShowError(email, password));
        }
        }
      })
    };
    let errorMessage = err => {
      <div>
        {switch(err){
        | Some(message) => { ReasonReact.string(message) }
        | None => ReasonReact.null
        }}
      </div>
    };

    /* Intentionally didn't add "required" field to show "~~~ is required" message. */
    <>
      <div>
        <input type_="text" onChange=onChangeEmail placeholder="your-best@email.com" />
        {errorMessage(self.state.errEmail)}
      </div>
      <div>
        <input type_="password" onChange=onChangePassword placeholder="password" />
        {errorMessage(self.state.errPassword)}
      </div>
      <div>
        <button onClick>{ ReasonReact.string("Login") }</button>
      </div>
    </>
  }
}