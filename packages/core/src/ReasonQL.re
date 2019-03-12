let gql = code => code;

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
  });

  type response = Js.t({.
    [@bs.meth] json: unit => Js.Promise.t(apolloResultJs),
  });

  [@bs.val]external fetch: (string, Js.Json.t) => Js.Promise.t(response) = "";

  let send: Q.variablesType => Js.Promise.t(apolloResultJs) = vars => {
    open Js.Promise;
    fetch(C.url, Obj.magic({
      "method": "POST",
      "headers": {
        "Content-Type": "application/json",
      },
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
}