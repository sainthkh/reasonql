type patchSize = 
  | Small
  | Medium
  | Large
  | ExtraLarge
  ;

[%%raw {|
var decodePatchSize = function (en) {
  let t = {
    "SMALL": 0,
    "MEDIUM": 1,
    "LARGE": 2,
    "EXTRA_LARGE": 3,
  };

  return t[en];
}

var encodePatchSize = function (en) {
  let t = [
    "SMALL",
    "MEDIUM",
    "LARGE",
    "EXTRA_LARGE",
  ];

  return t[en];
}

exports.decodePatchSize = decodePatchSize;
exports.encodePatchSize = encodePatchSize;
|}]