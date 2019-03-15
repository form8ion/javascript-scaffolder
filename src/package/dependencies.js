import chalk from 'chalk';
import install from './install';

export default async function ({projectType, contributors}) {
  console.error(chalk.grey('Installing devDependencies'));          // eslint-disable-line no-console

  await install([
    'npm-run-all',
    'ban-sensitive-files',
    ...contributors
      .map(contributor => contributor.devDependencies)
      .reduce((acc, devDependencies) => ([...acc, ...devDependencies]), []),
    ...'Package' === projectType ? ['rimraf', 'rollup', 'rollup-plugin-auto-external'] : []
  ]);
}
