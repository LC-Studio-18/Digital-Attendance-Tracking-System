const { spawn } = require('node:child_process');

const services = [
  { name: 'backend', args: ['--prefix', 'backend', 'run', 'dev'] },
  { name: 'frontend', args: ['--prefix', 'frontend', 'run', 'dev'] },
];

const children = [];
let stopping = false;

const terminate = (child) => {
  if (!child || child.exitCode !== null || child.pid === undefined) return;

  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
    });
    return;
  }

  child.kill('SIGTERM');
};

const stop = (code = 0) => {
  if (stopping) return;

  stopping = true;
  children.forEach(terminate);
  setTimeout(() => process.exit(code), 250);
};

for (const service of services) {
  const child =
    process.platform === 'win32'
      ? spawn('cmd.exe', [`/c npm ${service.args.join(' ')}`], {
          stdio: 'inherit',
        })
      : spawn('npm', service.args, { stdio: 'inherit' });

  children.push(child);

  child.on('exit', (code) => {
    if (stopping) return;
    stop(code ?? 0);
  });
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
