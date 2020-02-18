import {promises as fsPromises} from 'fs';
import {info} from '@travi/cli-messages';
import buildPackageDetails from './details';
import installDependencies from './dependencies';

export default async function ({
  projectRoot,
  projectType,
  contributors,
  packageName,
  license,
  vcs,
  author,
  description,
  packageProperties
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
    packageProperties
  });

  await fsPromises.writeFile(`${projectRoot}/package.json`, JSON.stringify(packageData));

  await installDependencies({contributors});

  return {homepage: packageData.homepage};
}
