import deepmerge from 'deepmerge';
import {info} from '@travi/cli-messages';
import chooseApplicationType from './prompt';
import scaffoldChosenApplicationType from '../choice-scaffolder';

const defaultBuildDirectory = 'lib';

export default async function ({
  applicationTypes,
  projectRoot,
  projectName,
  packageName,
  transpileLint,
  tests,
  decisions
}) {
  info('Scaffolding Application Details');

  if (false !== transpileLint) {
    const chosenType = await chooseApplicationType({types: applicationTypes, projectType: 'application', decisions});
    const results = await scaffoldChosenApplicationType(
      applicationTypes,
      chosenType,
      {projectRoot, projectName, packageName, tests}
    );

    const buildDirectory = results.buildDirectory || defaultBuildDirectory;

    return deepmerge(
      results,
      {
        scripts: {
          clean: `rimraf ./${buildDirectory}`,
          start: `node ./${buildDirectory}/index.js`,
          prebuild: 'run-s clean'
        },
        dependencies: [],
        devDependencies: ['rimraf'],
        vcsIgnore: {files: ['.env'], directories: [`/${buildDirectory}/`]},
        buildDirectory,
        packageProperties: {private: true},
        eslintConfigs: [],
        nextSteps: []
      }
    );
  }

  return {
    dependencies: [],
    devDependencies: [],
    scripts: {},
    vcsIgnore: {files: [], directories: []},
    eslintConfigs: [],
    nextSteps: []
  };
}
