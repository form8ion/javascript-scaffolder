import {promises as fs} from 'fs';
import {projectTypes} from '@form8ion/javascript-core';

export default async function ({config, projectType, projectRoot, testFilenamePattern}) {
  const eslintConfigs = ['typescript'];
  const shareableTsConfigPackage = `${config.scope}/tsconfig`;

  await fs.writeFile(
    `${projectRoot}/tsconfig.json`,
    JSON.stringify({
      $schema: 'https://json.schemastore.org/tsconfig',
      extends: shareableTsConfigPackage,
      compilerOptions: {
        rootDir: 'src',
        ...projectTypes.PACKAGE === projectType && {
          outDir: 'lib',
          declaration: true
        }
      },
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
