import chalk from 'chalk';
import chooseApplicationType from './prompt';

export default async function ({applicationTypes}) {
  console.log(chalk.blue('Scaffolding Application Details'));    // eslint-disable-line no-console

  await chooseApplicationType({types: applicationTypes});

  return {
    scripts: {start: './lib/index.js'},
    devDependencies: [],
    dependencies: [],
    vcsIgnore: {files: [], directories: []}
  };
}
