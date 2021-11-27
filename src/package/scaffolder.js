import {promises as fs} from 'fs';
import {info} from '@travi/cli-messages';
import buildPackageDetails from './details';

export default async function ({
  projectRoot,
  projectType,
  dialect,
  scripts,
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
    dialect,
    license,
    vcs,
    author,
    description,
    scripts,
    packageProperties,
    pathWithinParent
  });

  await fs.writeFile(`${projectRoot}/package.json`, JSON.stringify(packageData));

  return {homepage: packageData.homepage};
}
