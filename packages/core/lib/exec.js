const Commands = require('./commands')


function exec(name, options, command) {
  // console.log(name, options)
  // console.log(this.args)
  // console.log(this.opts())
  // console.error('Run script %s on port %s', this.args[0], this.opts().port);
  new Commands(name, options, command)

}

module.exports = exec