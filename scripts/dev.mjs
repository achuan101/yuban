import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const root=fileURLToPath(new URL('../',import.meta.url)),children=[spawn(process.execPath,['server/index.mjs'],{cwd:root,stdio:'inherit'}),spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','0.0.0.0'],{cwd:root,stdio:'inherit'})]
function close(){children.forEach(c=>c.kill('SIGTERM'))}
process.on('SIGINT',close);process.on('SIGTERM',close);children.forEach(c=>c.on('exit',code=>{close();process.exitCode=code||0}))
