import {writeFile} from 'mz/fs';
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
  ci,
  description,
  configs
}) {
  const packageData = await buildPackageDetails({
    projectName,
    visibility,
    scope,
    projectType,
    license,
    tests,
    vcs,
    author,
    ci,
    description,
    configs,
    contributors
  });

  await writeFile(`${projectRoot}/package.json`, JSON.stringify(packageData));

  await installDependencies({contributors});

  return {name: packageData.name, homepage: packageData.homepage};
}
