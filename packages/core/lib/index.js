'use strict';
const { log } = require('@man-cli-test/utils');



const pkg = require('../package.json');

function checkPkgVersion() {
  log.info('version:', pkg.version);
}


module.exports = core;

function core() {
  checkPkgVersion();
}


