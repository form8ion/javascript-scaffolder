import {info} from '@travi/cli-messages';
import {DEV_DEPENDENCY_TYPE, PROD_DEPENDENCY_TYPE, installDependencies} from '@form8ion/javascript-core';

export default async function ({contributors}) {
  info('Installing dependencies');

  await installDependencies(
    contributors
      .map(contributor => contributor.dependencies)
      .filter(Boolean)
      .reduce((acc, dependencies) => ([...acc, ...dependencies]), []),
    PROD_DEPENDENCY_TYPE
  );

  await installDependencies(
    [
      'npm-run-all',
      ...contributors
        .map(contributor => contributor.devDependencies)
        .filter(Boolean)
        .reduce((acc, devDependencies) => ([...acc, ...devDependencies]), [])
    ],
    DEV_DEPENDENCY_TYPE
  );
}
