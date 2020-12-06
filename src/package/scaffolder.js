import {promises as fsPromises} from 'fs';
import {info} from '@travi/cli-messages';
import buildPackageDetails from './details';

export default async function ({
  projectRoot,
  projectType,
  contributors,
  packageName,
  license,
  vcs,
  author,
  description,
  packageProperties,
  pathWithinParent
}) {
  info('Configuring package.json');

  const packageData = await buildPackageDetails({
    packageName,
    projectType,
    license,
    vcs,
    author,
    description,
    contributors,
    packageProperties,
    pathWithinParent
  });

  await fsPromises.writeFile(`${projectRoot}/package.json`, JSON.stringify(packageData));

  return {homepage: packageData.homepage};
}
