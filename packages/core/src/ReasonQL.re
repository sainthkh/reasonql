let gql = code => code;

type apolloErrorJs = Js.t({.
  message: string,
  extensions: Js.Json.t,
})

type apolloError = {
  message: string,
  extensions: Js.Json.t,
};

let decodeError: array(apolloErrorJs) => array(apolloError) 
= errors => {
  errors |> Array.map(err => {
    message: err##message,
    extensions: err##extensions,
  })
};

module type Client = {
  let url: string;
};

module type Query = {
  let query: string;
  
  type variablesType;
  let encodeVariables: variablesType => Js.Json.t;
  
  type queryResult
  let decodeQueryResult: Js.Json.t => queryResult;
};

module MakeRequest = (Q: Query, C: Client) => {
  type apolloResultJs = Js.t({.
    data: Js.Json.t,
    errors: option(array(apolloErrorJs)),
  });

  type response = Js.t({.
    [@bs.meth] json: unit => Js.Promise.t(apolloResultJs),
  });

  [@bs.val]external fetch: (string, Js.Json.t) => Js.Promise.t(response) = "";

  let send = (~headers=Js.Obj.empty(), ~vars: Q.variablesType): Js.Promise.t(apolloResultJs) => {
    open Js.Promise;
    fetch(C.url, Obj.magic({
      "method": "POST",
      "headers": Js.Obj.assign({
        "Content-Type": "application/json"
      }, headers),
      "body": Js.Json.stringify(Obj.magic({
        "query": Q.query,
        "variables": Q.encodeVariables(vars),
      }))
    }))
    |> then_((response:response) => {
      response##json();
    })
  }

  let finished: (Js.Promise.t(apolloResultJs), Q.queryResult => unit) => unit
  = (promise, f) => {
    open Js.Promise;

    promise 
    |> then_(json => {
      let data = Q.decodeQueryResult(json##data);
      resolve(f(data))
    })
    |> ignore;
  };

  let finishedWithError: (Js.Promise.t(apolloResultJs), (Q.queryResult, option(array(apolloError))) => unit) => unit
  = (promise, f) => {
    open Js.Promise;

    promise 
    |> then_(json => {
      let data = Q.decodeQueryResult(json##data);
      let errors = 
        switch(json##errors) {
        | Some(errors) => Some(decodeError(errors));
        | None => None
        }
      
      resolve(f(data, errors))
    })
    |> ignore;
  }
}