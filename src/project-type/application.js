import chalk from 'chalk';
import chooseApplicationType from './prompt';
import scaffoldChosenApplicationType from './choice-scaffolder';

const defaultBuildDirectory = './lib';

export default async function ({applicationTypes, projectRoot, configs}) {
  console.log(chalk.blue('Scaffolding Application Details'));    // eslint-disable-line no-console

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
    vcsIgnore: {files: results.vcsIgnore.files, directories: results.vcsIgnore.directories},
    buildDirectory: defaultBuildDirectory
  };
}
