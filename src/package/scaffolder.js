import {writeFile} from 'mz/fs';
import {info} from '@travi/cli-messages';
import buildPackageDetails from './details';
import installDependencies from './dependencies';

export default async function ({
  projectRoot,
  projectType,
  contributors,
  projectName,
  visibility,
  scope,
  license,
  tests,
  vcs,
  author,
  description
}) {
  info('Configuring package.json');

  const packageData = await buildPackageDetails({
    projectName,
    visibility,
    scope,
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

  return {name: packageData.name, homepage: packageData.homepage};
}
