import chalk from 'chalk';
import chooseApplicationType from './prompt';
import scaffoldChosenApplicationType from './choice-scaffolder';

export default async function ({applicationTypes, projectRoot}) {
  console.log(chalk.blue('Scaffolding Application Details'));    // eslint-disable-line no-console

  const chosenType = await chooseApplicationType({types: applicationTypes});
  const results = await scaffoldChosenApplicationType(applicationTypes, chosenType, {projectRoot});

  return {
    scripts: {start: './lib/index.js', ...results.scripts},
    dependencies: results.dependencies,
    devDependencies: results.devDependencies,
    vcsIgnore: {files: results.vcsIgnore.files, directories: results.vcsIgnore.directories}
  };
}
