const fs = require("fs");
const os = require("os");

function tmpFolder() {
  const folder = os.tmpdir() + '/tmp' + ~~(Math.random() * 1000000);
  // const folder = '/tmp/fu2_' + ~~(100000 * Math.random());
  fs.mkdirSync(folder);
  return folder;
}

module.exports = {
  tmpFolder: tmpFolder
}
