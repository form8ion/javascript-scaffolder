import {info} from '@travi/cli-messages';
import install from './install';

export default async function ({contributors}) {
  info('Installing dependencies');

  await install(
    contributors
      .map(contributor => contributor.dependencies)
      .filter(Boolean)
      .reduce((acc, dependencies) => ([...acc, ...dependencies]), []),
    'prod'
  );

  await install(
    [
      'npm-run-all',
      ...contributors
        .map(contributor => contributor.devDependencies)
        .filter(Boolean)
        .reduce((acc, devDependencies) => ([...acc, ...devDependencies]), [])
    ],
    'dev'
  );
}
