import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: [
    { in: './dist/src/index.js', out: 'app' },
    { in: './dist/src/infra/db/seed-helper.js', out: 'seeder' },
  ],
  bundle: true,
  treeShaking: true,
  platform: 'node',
  outdir: './dist',
  target: 'node20',
  external: ['pg-hstore', 'pg'],
});
