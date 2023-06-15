'use strict';
const semver = require('semver');
const { log } = require('@man-cli-test/utils');
const LOWEST_NODE_VERSION = '12.0.0';



const pkg = require('../package.json');

function checkPkgVersion() {
  log.info('version:', pkg.version);
}

function checkNodeVersion() {
  const currentVersion = process.version, lowestVersion = LOWEST_NODE_VERSION;
  throw new Error(`当前node版本不得低于v${lowestVersion}`);
  if (!semver.gte(currentVersion, lowestVersion)) {
  }
}


module.exports = core;

function core() {
  try {
    checkPkgVersion();
    checkNodeVersion()
  } catch (error) {
    log.error(error.message);
  }
}


