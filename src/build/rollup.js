import {promises as fs} from 'fs';
import determinePathToTemplateFile from '../template-path';

export async function scaffold({projectRoot}) {
  await fs.copyFile(determinePathToTemplateFile('rollup.config.js'), `${projectRoot}/rollup.config.js`);

  return {
    devDependencies: ['rollup', 'rollup-plugin-auto-external'],
    scripts: {
      'build:js': 'rollup --config',
      watch: 'run-s \'build:js -- --watch\''
    }
  };
}
