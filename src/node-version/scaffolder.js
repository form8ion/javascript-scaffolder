import chalk from 'chalk';
import {writeFile} from 'mz/fs';
import {determineLatestVersionOf, install as installNodeVersion} from './tasks';

export default async function ({projectRoot, nodeVersionCategory}) {
  const lowerCaseCategory = nodeVersionCategory.toLowerCase();
  console.log(chalk.blue(`Configuring ${lowerCaseCategory} version of node`));    // eslint-disable-line no-console

  const version = await determineLatestVersionOf(nodeVersionCategory);

  await writeFile(`${projectRoot}/.nvmrc`, version);

  await installNodeVersion(nodeVersionCategory);

  return version;
}
