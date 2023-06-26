// windows上执行的 spawn('cmd', ['/c', 'node', '-e', code], {})
function spawn(command, args, options) {
  const win32 = process.platform === 'win32';   // 获取当前系统是否Windows
  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;
  return require('child_process').spawn(cmd, cmdArgs, options || {});
}

// windows上执行的 spawn('cmd', ['/c', 'node', '-e', code], {})
function spawnAsync(command, args, options) {
  return new Promise((resolve, reject) => {
    const p = spawn(command, args, options);
    p.on('error', e => {
      reject(e)
    })
    p.on('exit', c => {
      resolve(c)
    })
  })
}

module.exports = { spawn, spawnAsync }