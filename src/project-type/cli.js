import {copyFile} from 'mz/fs';
import defineBadges from './package/badges';
import determinePathToTemplateFile from '../template-path';

const defaultBuildDirectory = 'bin';

export default async function ({packageName, visibility, projectRoot}) {
  await copyFile(determinePathToTemplateFile('rollup.config.js'), `${projectRoot}/rollup.config.js`);

  return {
    scripts: {
      clean: `rimraf ./${defaultBuildDirectory}`,
      prebuild: 'run-s clean',
      build: 'npm-run-all --print-label --parallel build:*',
      'build:js': 'rollup --config',
      watch: 'run-s \'build:js -- --watch\'',
      prepack: 'run-s build'
    },
    dependencies: ['update-notifier'],
    devDependencies: [
      'rimraf',
      'rollup',
      'rollup-plugin-auto-external',
      'rollup-plugin-executable',
      'rollup-plugin-json'
    ],
    vcsIgnore: {files: [], directories: [`/${defaultBuildDirectory}/`]},
    buildDirectory: defaultBuildDirectory,
    badges: defineBadges(packageName, visibility),
    packageProperties: {
      version: '0.0.0-semantically-released',
      bin: {},
      files: ['bin/'],
      publishConfig: {access: 'Public' === visibility ? 'public' : 'restricted'}
    },
    eslintConfigs: [],
    nextSteps: []
  };
}
