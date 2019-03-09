/* Generated by ReasonQL Compiler, PLEASE EDIT WITH CARE */

let query = {|
query AppQuery {
  id
  name
  married
  age
  closeRate
}
|}

type queryResult = {
  id: string,
  name: string,
  married: bool,
  age: int,
  closeRate: float,
};

type variablesType = Js.Dict.t(Js.Json.t);
let encodeVariables: variablesType => Js.Json.t = vars => Js.Json.object_(vars);

[@bs.module "./AppQuery.codec"]external decodeQueryResult: Js.Json.t => queryResult = "decodeQueryResult";