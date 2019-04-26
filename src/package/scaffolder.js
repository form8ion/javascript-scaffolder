import {writeFile} from 'mz/fs';
import {info} from '@travi/cli-messages';
import buildPackageDetails from './details';
import installDependencies from './dependencies';

export default async function ({
  projectRoot,
  projectType,
  contributors,
  packageName,
  visibility,
  license,
  tests,
  vcs,
  author,
  description
}) {
  info('Configuring package.json');

  const packageData = await buildPackageDetails({
    packageName,
    visibility,
    projectType,
    license,
    tests,
    vcs,
    author,
    description,
    contributors
  });

  await writeFile(`${projectRoot}/package.json`, JSON.stringify(packageData));

  await installDependencies({contributors});

  return {homepage: packageData.homepage};
}
