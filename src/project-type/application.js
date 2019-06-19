import {info} from '@travi/cli-messages';
import chooseApplicationType from './prompt';
import scaffoldChosenApplicationType from './choice-scaffolder';

const defaultBuildDirectory = 'lib';

export default async function ({applicationTypes, projectRoot, transpileLint}) {
  info('Scaffolding Application Details');

  if (false !== transpileLint) {
    const chosenType = await chooseApplicationType({types: applicationTypes});
    const results = await scaffoldChosenApplicationType(applicationTypes, chosenType, {projectRoot});

    return {
      scripts: {
        clean: `rimraf ./${defaultBuildDirectory}`,
        start: `./${defaultBuildDirectory}/index.js`,
        prebuild: 'run-s clean',
        ...results.scripts
      },
      dependencies: results.dependencies,
      devDependencies: ['rimraf', ...results.devDependencies],
      vcsIgnore: {
        files: [...results.vcsIgnore.files, '.env'],
        directories: [...results.vcsIgnore.directories, `/${defaultBuildDirectory}/`]
      },
      buildDirectory: defaultBuildDirectory,
      packageProperties: {private: true}
    };
  }

  return {
    dependencies: [],
    devDependencies: [],
    scripts: {},
    vcsIgnore: {files: [], directories: []}
  };
}
