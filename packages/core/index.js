'use strict';
const semver = require('semver');
const { homedir } = require('os');
const pathExists = require('path-exists').sync;
const { Command } = require('commander')

const { log } = require('@man-cli-test/utils');

const exec = require('./lib/exec')

const LOWEST_NODE_VERSION = '16.0.0';



const pkg = require('./package.json');
const program = new Command();


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


function registryCommand() {
  /* -------------------------官网示例演示选项功能----------------------------------*/

  // program
  //   .option('-d, --debug', 'output extra debugging')
  //   .option('-s, --small', 'small pizza size')
  //   .option('-p, --pizza-type <type>', 'flavour of pizza');

  // program.parse(process.argv);

  // const options = program.opts();
  // if (options.debug) console.log(options);
  // console.log('pizza details:');
  // if (options.small) console.log('- small pizza size');
  // if (options.pizzaType) console.log(`- ${options.pizzaType}`);

  /* -------------------------官网示例演示命令功能----------------------------------*/
  // program
  //   .command('clone <source> [destination]')
  //   .description('clone a repository into a newly created directory')
  //   .action((source, destination) => {
  //     console.log('clone command called');
  //   });


  /* -------------------------官网示例演示命令参数功能----------------------------------*/

  // program
  //   .version(pkg.version)
  //   .argument('<username>', 'user to login')
  //   .argument('[password]', 'password for user, if required', 'no password given')
  //   .action((username, password) => {
  //     console.log('username:', username);
  //     console.log('password:', password);
  //   });

  /* -------------------------在帮助信息中加上脚手架命令----------------------------------*/
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [option]')        // Usage: man-cli-test <command> [option]
    .option('-d, --debug', '是否开启调试模式', false)
    .version(pkg.version);


  program.on('command:*', function (commands) {
    const availableCommands = program.commands.map(cmd => cmd.name());  // program.commands获取已注册的命令，cmd.name()获取命令名字
    log.error('未知命令：', commands[0]);  // commands获取输入的命令
    if (availableCommands.length > 0) {
      log.info('可用命令：', availableCommands.join(','))
    }
  })

  program
    .command('init [projectName]')
    .option('-f, --force', '是否强制化初始项目')
    .action(exec)


  program.parse(process.argv)   // 此行必需要有
}

module.exports = core;

function core() {
  try {
    checkPkgVersion()
    checkNodeVersion()
    // checkRoot()
    checkUserHome();
    registryCommand()
  } catch (error) {
    log.error(error.message);
  }
}


