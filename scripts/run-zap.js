import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const useDocker = !!process.env.USE_DOCKER || !process.env.ZAP_PATH;
const targetUrl = process.env.TARGET_URL || (useDocker ? 'http://host.docker.internal:3000' : 'http://localhost:3000');
const mode = process.argv[2] || 'baseline';
const reportDir = path.resolve(process.cwd(), 'reports');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

function resolveZapCommand() {
  if (process.env.ZAP_PATH) {
    return { command: process.env.ZAP_PATH, args: [] };
  }

  const windowsCandidates = [
    'C:\\Program Files\\OWASP ZAP\\zap.bat',
    'C:\\Program Files (x86)\\OWASP ZAP\\zap.bat',
    'C:\\Program Files\\OWASP ZAP\\zap.exe',
    'C:\\Program Files (x86)\\OWASP ZAP\\zap.exe',
  ];

  if (process.platform === 'win32') {
    const installed = windowsCandidates.find(candidate => fs.existsSync(candidate));
    if (installed) return { command: installed, args: [] };
  }

  const unixCandidates = ['/usr/share/zaproxy/zap.sh', '/usr/local/bin/zap', '/opt/zaproxy/zap.sh'];
  const installedUnix = unixCandidates.find(candidate => fs.existsSync(candidate));
  if (installedUnix) return { command: installedUnix, args: [] };

  const commandToCheck = process.platform === 'win32' ? 'where' : 'which';
  const result = spawnSync(commandToCheck, ['zap'], { shell: process.platform === 'win32', stdio: 'ignore' });
  if (result.status === 0) return { command: 'zap', args: [] };

  const dockerAvailable = spawnSync('docker', ['--version'], { stdio: 'ignore' }).status === 0;
  if (dockerAvailable) {
    const reportPath = path.join(reportDir, `zap-${mode}-${timestamp}.json`);
    return {
      command: 'docker',
      args: [
        'run', '--rm',
        '--add-host=host.docker.internal:host-gateway',
        '-v', `${process.cwd()}:/zap/wrk:rw`,
        'ghcr.io/zaproxy/zaproxy:stable',
        'zap.sh',
        '-cmd',
        '-quickurl', targetUrl,
        '-quickout', `/zap/wrk/${path.relative(process.cwd(), reportPath)}`,
        '-quickprogress',
        '-config', 'globalexcludeurl.url_list=^https?://localhost:5173$'
      ]
    };
  }

  return null;
}

fs.mkdirSync(reportDir, { recursive: true });

const dockerMode = process.env.USE_DOCKER === 'true' || process.env.USE_DOCKER === '1';
const resolved = resolveZapCommand();

if (!resolved) {
  console.error('ZAP no está instalado ni disponible via Docker.');
  console.error('Instálalo desde https://www.zaproxy.org/download/ o usa Docker con:');
  console.error('  docker run --rm -v "%cd%:/zap/wrk" owasp/zap2docker-stable zap.sh -cmd -quickurl http://host.docker.internal:3000 -quickout /zap/wrk/reports/zap-baseline.json -quickprogress');
  console.error('  o bien:');
  console.error('  ZAP_PATH="C:\\Program Files\\OWASP ZAP\\zap.bat" npm run security:zap:baseline');
  process.exit(1);
}

const baseArgs = [
  '-cmd',
  '-quickurl', targetUrl,
  '-quickout', path.join(reportDir, `zap-${mode}-${timestamp}.json`),
  '-quickprogress'
];

const zapCommand = resolved.command;
const zapArgs = resolved.args.length > 0 ? resolved.args : baseArgs;

console.log(`Escaneando ${targetUrl} con ZAP en modo ${mode}...`);
console.log(`Comando: ${zapCommand} ${zapArgs.join(' ')}`);

const child = spawn(zapCommand, zapArgs, {
  stdio: 'inherit',
  shell: process.platform === 'win32' && !resolved.args.length,
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(`Escaneo completado. Reporte generado en ${reportDir}`);
    return;
  }

  console.error(`ZAP devolvió código ${code}. Asegúrate de tenerlo instalado y de que la app esté levantada en ${targetUrl}.`);
  process.exit(code ?? 1);
});

child.on('error', (error) => {
  console.error('No se pudo ejecutar ZAP. Revisa la ruta de instalación, usa ZAP_PATH, o prueba con Docker.');
  console.error(error.message);
  process.exit(1);
});
