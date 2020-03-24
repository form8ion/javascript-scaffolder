import {info} from '@travi/cli-messages';
import install, {DEV_DEPENDENCY_TYPE, PROD_DEPENDENCY_TYPE} from './install';

export default async function ({contributors}) {
  info('Installing dependencies');

  await install(
    contributors
      .map(contributor => contributor.dependencies)
      .filter(Boolean)
      .reduce((acc, dependencies) => ([...acc, ...dependencies]), []),
    PROD_DEPENDENCY_TYPE
  );

  await install(
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
