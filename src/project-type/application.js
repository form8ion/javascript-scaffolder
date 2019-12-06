import {info} from '@travi/cli-messages';
import chooseApplicationType from './prompt';
import scaffoldChosenApplicationType from './choice-scaffolder';

const defaultBuildDirectory = 'lib';

export default async function ({applicationTypes, projectRoot, projectName, transpileLint, tests}) {
  info('Scaffolding Application Details');

  if (false !== transpileLint) {
    const chosenType = await chooseApplicationType({types: applicationTypes, projectType: 'application'});
    const results = await scaffoldChosenApplicationType(
      applicationTypes,
      chosenType,
      {projectRoot, projectName, tests}
    );

    return {
      scripts: {
        clean: `rimraf ./${defaultBuildDirectory}`,
        start: `node ./${defaultBuildDirectory}/index.js`,
        prebuild: 'run-s clean',
        ...results.scripts
      },
      dependencies: [...results.dependencies ? results.dependencies : []],
      devDependencies: ['rimraf', ...results.devDependencies ? results.devDependencies : []],
      vcsIgnore: {
        files: [...results.vcsIgnore ? results.vcsIgnore.files : [], '.env'],
        directories: [...results.vcsIgnore ? results.vcsIgnore.directories : [], `/${defaultBuildDirectory}/`]
      },
      buildDirectory: defaultBuildDirectory,
      packageProperties: {private: true},
      ...results.documentation && {documentation: results.documentation},
      eslintConfigs: results.eslintConfigs || []
    };
  }

  return {
    dependencies: [],
    devDependencies: [],
    scripts: {},
    vcsIgnore: {files: [], directories: []},
    eslintConfigs: []
  };
}
