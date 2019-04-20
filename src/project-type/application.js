import {info} from '@travi/cli-messages';
import chooseApplicationType from './prompt';
import scaffoldChosenApplicationType from './choice-scaffolder';

const defaultBuildDirectory = './lib';

export default async function ({applicationTypes, projectRoot, configs}) {
  info('Scaffolding Application Details');

  const chosenType = await chooseApplicationType({types: applicationTypes});
  const results = await scaffoldChosenApplicationType(applicationTypes, chosenType, {projectRoot, configs});

  return {
    scripts: {
      clean: `rimraf ${defaultBuildDirectory}`,
      start: `${defaultBuildDirectory}/index.js`,
      prebuild: 'run-s clean',
      ...results.scripts
    },
    dependencies: results.dependencies,
    devDependencies: ['rimraf', ...results.devDependencies],
    vcsIgnore: {files: results.vcsIgnore.files, directories: [...results.vcsIgnore.directories, '/lib/']},
    buildDirectory: defaultBuildDirectory
  };
}
