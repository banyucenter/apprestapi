#!/usr/bin/env node
const program = require('commander');
const updateNotifier = require('update-notifier');
const caniuseYarn = require('../lib');
const pkg = require('../package.json');

// notify on new version
updateNotifier({ pkg }).notify({ defer: false });

program
  .version(pkg.version)
  .parse(process.argv);

process.exit(caniuseYarn() ? 0 : 1);
