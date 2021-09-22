import {promises as fs} from 'fs';

export default async function ({config, projectRoot}) {
  const eslintConfigs = ['typescript'];
  const shareableTsConfigPackage = `${config.scope}/tsconfig`;

  await fs.writeFile(
    `${projectRoot}/tsconfig.json`,
    JSON.stringify({
      $schema: 'https://json.schemastore.org/tsconfig',
      extends: shareableTsConfigPackage
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
