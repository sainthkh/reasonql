const fs = require('fs');
const path = require('path');

const isDirectory = source => fs.statSync(source).isDirectory()
const getDirectories = source =>
  fs.readdirSync(source)
  .map(name => path.join(source, name))
  .filter(isDirectory)

const getFiles = source => 
  fs.readdirSync(source)
  .map(name => path.join(source, name))
  .filter(source => !isDirectory(source))

let normalizeNewline = code =>
  code
    .replace(/\r\n/g, '\n') 
    .replace(/\r/g, '\n');

const compareTexts = (name, expected, received) => {
  test(name, () => {
    let e = normalizeNewline(expected);
    let r = normalizeNewline(received);
    expect(e).toBe(r);
  })
}

module.exports = {
  getDirectories,
  getFiles,
  compareTexts,
}