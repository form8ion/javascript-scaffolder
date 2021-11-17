import {promises as fs} from 'fs';
import deepmerge from 'deepmerge';
import {dialects, projectTypes} from '@form8ion/javascript-core';
import determinePathToTemplateFile from '../template-path';

export async function scaffold({projectRoot, dialect, projectType}) {
  await fs.copyFile(determinePathToTemplateFile('rollup.config.js'), `${projectRoot}/rollup.config.js`);

  return deepmerge.all([
    {
      devDependencies: ['rollup', 'rollup-plugin-auto-external'],
      scripts: {
        'build:js': 'rollup --config',
        watch: 'run-s \'build:js -- --watch\''
      }
    },
    {
      ...projectTypes.CLI === projectType && {
        devDependencies: ['@rollup/plugin-json', 'rollup-plugin-executable']
      }
    },
    {
      ...dialects.TYPESCRIPT === dialect && {
        devDependencies: ['@rollup/plugin-typescript'],
        vcsIgnore: {directories: ['.rollup.cache/']}
      }
    }
  ]);
}
