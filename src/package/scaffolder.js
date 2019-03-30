import {writeFile} from 'mz/fs';
import chalk from 'chalk';
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
  console.log(chalk.blue('Configuring package.json'));    // eslint-disable-line no-console

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
