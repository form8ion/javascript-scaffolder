import {promises as fsPromises} from 'fs';
import {info} from '@travi/cli-messages';
import {determineLatestVersionOf, install as installNodeVersion} from './tasks';

export default async function ({projectRoot, nodeVersionCategory}) {
  if (!nodeVersionCategory) return undefined;

  const lowerCaseCategory = nodeVersionCategory.toLowerCase();
  info(`Configuring ${lowerCaseCategory} version of node`);

  const version = await determineLatestVersionOf(nodeVersionCategory);

  await fsPromises.writeFile(`${projectRoot}/.nvmrc`, version);

  await installNodeVersion(nodeVersionCategory);

  return version;
}
