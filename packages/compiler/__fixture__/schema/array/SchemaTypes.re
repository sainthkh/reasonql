/* Generated by Reason Relay Compiler, PLEASE EDIT WITH CARE */

type person = {
  id: string,
  name: string,
};

type document = {
  i1: option(array(option(int))),
  i2: array(option(int)),
  i3: option(array(int)),
  i4: array(int),
  p1: option(array(option(person))),
  p2: array(option(person)),
  p3: option(array(person)),
  p4: array(person),
};

[@bs.module "./SchemaTypes.codec"]external decodeQueryResponse: Js.Json.t => document = "decodeQueryResponse";