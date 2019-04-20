import {writeFile} from 'mz/fs';
import {info} from '@travi/cli-messages';
import {determineLatestVersionOf, install as installNodeVersion} from './tasks';

export default async function ({projectRoot, nodeVersionCategory}) {
  const lowerCaseCategory = nodeVersionCategory.toLowerCase();
  info(`Configuring ${lowerCaseCategory} version of node`);

  const version = await determineLatestVersionOf(nodeVersionCategory);

  await writeFile(`${projectRoot}/.nvmrc`, version);

  await installNodeVersion(nodeVersionCategory);

  return version;
}
