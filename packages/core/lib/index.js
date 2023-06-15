'use strict';
const semver = require('semver');
const { homedir } = require('os');
const pathExists = require('path-exists').sync;

const { log } = require('@man-cli-test/utils');

const LOWEST_NODE_VERSION = '12.0.0';



const pkg = require('../package.json');

function checkPkgVersion() {
  log.info('version:', pkg.version);
}

function checkNodeVersion() {
  const currentVersion = process.version, lowestVersion = LOWEST_NODE_VERSION;
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(`当前node版本不得低于v${lowestVersion}`);
  }
}


// process.geteuid()无法在windows中使用，因此这个功能不做演示
function checkRoot() {
  // console.log(process.geteuid())
  // const rootCheck = require('root-check');
  // rootCheck();
}


function checkUserHome() {
  // console.log('usr', homedir())    // C:\Users\满
  if (!homedir() || !pathExists(homedir())) {
    throw new Error('当前登录用户主目录不存在')
  }
}


module.exports = core;

function core() {
  try {
    checkPkgVersion()
    checkNodeVersion()
    // checkRoot()
    checkUserHome();

  } catch (error) {
    log.error(error.message);
  }
}


