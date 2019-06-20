type timestamptz = Js.Date.t;

let decodeTimestamptz = Js.Date.fromString;

let encodeTimestamptz = Js.Date.toISOString;

type uuid;

[%%raw {|

function decodeUuid (val) {
  return val;
}

function encodeUuid (val) {
  return val;
}
|}];

let decodeUuid: Js.Json.t => uuid = [%raw {|a => a|}];
let encodeUuid: uuid => Js.Json.t = [%raw {|a => a|}];
external uuidToString: uuid => string = "%identity";