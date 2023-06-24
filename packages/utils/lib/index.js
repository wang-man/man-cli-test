'use strict';

const log = require('./log')
const request = require('./request')
const { spinnerStart, sleep } = require('./spinner')
const { getNpmInfo, getNpmVersions, getLastVersion, getDefaultRegistry, getLatestVersion } = require('./getVersion')

module.exports = { log, request, spinnerStart, sleep, getNpmInfo, getNpmVersions, getLastVersion, getDefaultRegistry, getLatestVersion };
