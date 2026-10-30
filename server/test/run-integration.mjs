import { randomUUID } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const serverRoot = fileURLToPath(new URL('../', import.meta.url));
const project = 'everybody-render-' + randomUUID().slice(0, 8);
const compose = ['compose', '-p', project, '-f', 'deploy/compose.test.yaml'];
let status = 1;
try {
  execFileSync('docker', [...compose, 'up', '-d', '--build', '--wait'], { cwd: root, stdio: 'inherit', timeout: 180000 });
  const port = (service, number) => execFileSync('docker', [...compose, 'port', service, String(number)], { cwd: root, encoding: 'utf8' }).trim();
  const result = spawnSync(process.execPath, ['--test', 'test/integration.mjs'], {
    cwd: serverRoot, stdio: 'inherit', timeout: 60000,
    env: { ...process.env,
      TEST_DATABASE_URL: `postgres://render_owner:local-test-owner-password@${port('database', 5432)}/polls_test`,
      TEST_AUTH_URL: `http://${port('auth', 9999)}`,
    },
  });
  status = result.status ?? 1;
} finally {
  // Only remove resources with this invocation's randomly generated project name.
  execFileSync('docker', [...compose, 'down', '-v'], { cwd: root, stdio: 'inherit', timeout: 30000 });
}
process.exitCode = status;
