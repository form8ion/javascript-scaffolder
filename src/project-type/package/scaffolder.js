import {copyFile} from 'mz/fs';
import {info} from '@travi/cli-messages';
import determinePathToTemplateFile from '../../template-path';
import defineBadges from './badges';

const defaultBuildDirectory = './lib';

export default async function ({projectRoot, transpileLint, packageName, visibility}) {
  info('Scaffolding Package Details');

  if (false !== transpileLint) {
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
      vcsIgnore: {
        files: [],
        directories: ['/lib/']
      },
      buildDirectory: defaultBuildDirectory,
      badges: defineBadges(packageName, visibility)
    };
  }

  return {
    devDependencies: [],
    scripts: {},
    vcsIgnore: {files: [], directories: []},
    badges: defineBadges(packageName, visibility)
  };
}
