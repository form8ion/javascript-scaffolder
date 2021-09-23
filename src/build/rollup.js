import {promises as fs} from 'fs';
import deepmerge from 'deepmerge';
import {dialects} from '@form8ion/javascript-core';
import determinePathToTemplateFile from '../template-path';

export async function scaffold({projectRoot, dialect}) {
  await fs.copyFile(determinePathToTemplateFile('rollup.config.js'), `${projectRoot}/rollup.config.js`);

  return deepmerge(
    {
      devDependencies: ['rollup', 'rollup-plugin-auto-external'],
      scripts: {
        'build:js': 'rollup --config',
        watch: 'run-s \'build:js -- --watch\''
      }
    },
    {
      ...dialects.TYPESCRIPT === dialect && {
        devDependencies: ['@rollup/plugin-typescript'],
        vcsIgnore: {directories: ['.rollup.cache/']}
      }
    }
  );
}
