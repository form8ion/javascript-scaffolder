import chalk from 'chalk';
import uniq from 'lodash.uniq';
import install from './install';

export default async function ({projectType, contributors, vcs}) {
  console.error(chalk.grey('Installing devDependencies'));          // eslint-disable-line no-console

  await install(uniq([
    'npm-run-all',
    ...contributors
      .map(contributor => contributor.devDependencies)
      .reduce((acc, devDependencies) => ([...acc, ...devDependencies]), []),
    ...vcs ? ['ban-sensitive-files'] : [],
    ...'Package' === projectType ? ['rimraf', 'rollup', 'rollup-plugin-auto-external'] : []
  ]));
}
