import {copyFile} from 'mz/fs';
import determinePathToTemplateFile from '../template-path';

export default async function ({projectRoot}) {
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
