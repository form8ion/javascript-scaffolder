import {copyFile} from 'mz/fs';
import chalk from 'chalk';
import determinePathToTemplateFile from '../template-path';

export default async function ({projectRoot}) {
  console.log(chalk.blue('Scaffolding Package Details'));    // eslint-disable-line no-console

  await copyFile(determinePathToTemplateFile('rollup.config.js'), `${projectRoot}/rollup.config.js`);

  return {
    devDependencies: ['rimraf', 'rollup', 'rollup-plugin-auto-external'],
    scripts: {
      clean: 'rimraf lib/',
      build: 'run-s clean build:*',
      'build:js': 'rollup -c',
      watch: 'run-s \'build:js -- --watch\'',
      prepack: 'run-s build'
    },
    vcsIgnore: {files: [], directories: []}
  };
}
