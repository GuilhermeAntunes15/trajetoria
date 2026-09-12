import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve(process.argv[2] ?? 'prisma-runtime');
const projectRoot = path.resolve(import.meta.dirname, '..');
const rootModules = path.join(projectRoot, 'node_modules');

// Resolução manual (em vez de require.resolve) porque muitos pacotes do tree do CLI declaram
// "exports" sem "./package.json" e seriam impossíveis de localizar via resolver do Node.
function packageDir(name, fromDir) {
  let current = fromDir;
  while (true) {
    const candidate = path.join(current, 'node_modules', name);
    if (fs.existsSync(path.join(candidate, 'package.json'))) return candidate;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

const visited = new Set();
const queue = [['prisma', projectRoot]];

while (queue.length > 0) {
  const [name, fromDir] = queue.shift();
  const dir = packageDir(name, fromDir);
  if (dir === null || visited.has(dir)) continue;
  visited.add(dir);

  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
  const deps = [
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.optionalDependencies ?? {}),
  ];
  for (const dep of deps) queue.push([dep, dir]);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const dir of visited) {
  const relative = path.relative(rootModules, dir);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Pacote fora de node_modules: ${dir}`);
  }
  const target = path.join(outDir, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(dir, target, { recursive: true, dereference: true });
}

console.log(`${visited.size} pacotes copiados para ${outDir}`);
