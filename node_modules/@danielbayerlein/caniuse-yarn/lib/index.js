const shelljs = require('shelljs');

function caniuseYarn() {
  return !!shelljs.which('yarn');
}

module.exports = caniuseYarn;
