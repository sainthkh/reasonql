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
    [@bs.meth] json: unit => Repromise.t(apolloResultJs),
  });

  [@bs.val]external fetch: (string, Js.Json.t) => Repromise.t(response) = "";

  let send: Q.variablesType => Repromise.t(apolloResultJs) = vars => {
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
    |> Repromise.andThen((response:response) => {
      response##json();
    })
  }

  let finished: (Repromise.t(apolloResultJs), Q.queryResult => unit) => unit
  = (promise, f) => {
    promise 
    |> Repromise.map(json => {
      let data = Q.decodeQueryResult(json##data);
      f(data)
    })
    |> ignore;
  };
}