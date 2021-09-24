import {promises as fs} from 'fs';

export default async function ({config, projectRoot, testFilenamePattern}) {
  const eslintConfigs = ['typescript'];
  const shareableTsConfigPackage = `${config.scope}/tsconfig`;

  await fs.writeFile(
    `${projectRoot}/tsconfig.json`,
    JSON.stringify({
      $schema: 'https://json.schemastore.org/tsconfig',
      extends: shareableTsConfigPackage,
      compilerOptions: {rootDir: 'src'},
      include: ['src/**/*.ts'],
      ...testFilenamePattern && {exclude: [testFilenamePattern]}
    })
  );

  return {
    eslint: {configs: eslintConfigs},
    eslintConfigs,
    devDependencies: ['typescript', shareableTsConfigPackage],
    packageProperties: {types: 'lib/index.d.ts'},
    vcsIgnore: {files: ['tsconfig.tsbuildinfo']}
  };
}
