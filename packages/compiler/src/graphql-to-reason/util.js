function upperTheFirstCharacter(name) {
  return name[0].toUpperCase() + name.substring(1);
}

function lowerTheFirstCharacter(name) {
  return name[0].toLowerCase() + name.substring(1);
}

exports.upperTheFirstCharacter = upperTheFirstCharacter;
exports.lowerTheFirstCharacter = lowerTheFirstCharacter;