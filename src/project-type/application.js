import chalk from 'chalk';

export default function () {
  console.log(chalk.blue('Scaffolding Application Details'));    // eslint-disable-line no-console

  return {
    scripts: {start: './lib/index.js'},
    devDependencies: [],
    dependencies: [],
    vcsIgnore: {files: [], directories: []}
  };
}
