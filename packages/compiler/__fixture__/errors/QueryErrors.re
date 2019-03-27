type loginFormError = {
  code: string,
  email: option(string),
  password: option(string),
};

[%%raw {|
var decodeLoginFormError = function (ext) {
  return [
    ext.code,
    ext.exception.email,
    ext.exception.password,
  ]
}
|}]

[@bs.val]external decodeLoginFormErrorJs: Js.Json.t => loginFormError = "decodeLoginFormError";
let decodeLoginFormError = decodeLoginFormErrorJs;