'use strict';

const { spawn, spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const mode = process.argv[2];
const npmCli = process.env.npm_execpath;

if (!['dev', 'start'].includes(mode) || !npmCli) {
  console.error('Use npm run dev ou npm start na raiz do projeto.');
  process.exit(1);
}

const children = [];
let closing = false;

function stopChildren() {
  for (const child of children) {
    if (!child.pid || child.exitCode !== null || child.signalCode !== null) continue;
    if (process.platform === 'win32') {
      const taskkill = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'taskkill.exe');
      spawnSync(taskkill, ['/pid', String(child.pid), '/t', '/f'], {
        stdio: 'ignore',
        windowsHide: true,
      });
    } else {
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch (error) {
        if (error.code !== 'ESRCH') console.error(error.message);
      }
    }
  }
}

function shutdown(code) {
  if (closing) return;
  closing = true;
  stopChildren();
  process.exit(code);
}

process.on('SIGINT', () => shutdown(130));
process.on('SIGTERM', () => shutdown(143));
process.on('exit', stopChildren);

function launch(name, folder, script, args = [], loadEnv = false) {
  const nodeArgs = loadEnv ? ['--env-file-if-exists=.env'] : [];
  const child = spawn(process.execPath, [...nodeArgs, npmCli, 'run', script, '--', ...args], {
    cwd: path.join(root, folder),
    env: process.env,
    stdio: 'inherit',
    detached: process.platform !== 'win32',
    windowsHide: true,
  });
  children.push(child);
  child.once('error', (error) => {
    console.error(`${name}: ${error.message}`);
    shutdown(1);
  });
  child.once('exit', (code, signal) => {
    if (closing) return;
    console.error(`${name} parou (${signal || `código ${code}`}); encerrando o outro serviço.`);
    shutdown(code && code > 0 ? code : 1);
  });
}

console.log('Frontend: http://localhost:5173 | API: http://localhost:3000/api');
console.log('Ctrl+C encerra os dois serviços. As portas podem ser configuradas nos arquivos .env.');
launch('API', 'backend', mode === 'dev' ? 'start:dev' : 'start:prod', [], true);
launch('Frontend', 'frontend', mode === 'dev' ? 'dev' : 'preview', ['--host', '127.0.0.1', '--port', '5173', '--strictPort']);
