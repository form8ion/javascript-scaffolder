import {copyFile} from 'mz/fs';
import chalk from 'chalk';
import determinePathToTemplateFile from '../template-path';

const defaultBuildDirectory = './lib';

export default async function ({projectRoot}) {
  console.log(chalk.blue('Scaffolding Package Details'));    // eslint-disable-line no-console

  await copyFile(determinePathToTemplateFile('rollup.config.js'), `${projectRoot}/rollup.config.js`);

  return {
    devDependencies: ['rimraf', 'rollup', 'rollup-plugin-auto-external'],
    scripts: {
      clean: `rimraf ${defaultBuildDirectory}`,
      prebuild: 'run-s clean',
      build: 'npm-run-all --print-label --parallel build:*',
      'build:js': 'rollup --config',
      watch: 'run-s \'build:js -- --watch\'',
      prepack: 'run-s build'
    },
    vcsIgnore: {files: [], directories: []},
    buildDirectory: defaultBuildDirectory
  };
}
