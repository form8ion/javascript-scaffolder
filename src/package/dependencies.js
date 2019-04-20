import uniq from 'lodash.uniq';
import {info} from '@travi/cli-messages';
import install from './install';

export default async function ({contributors}) {
  info('Installing devDependencies', {level: 'secondary'});

  await install(uniq([
    'npm-run-all',
    ...contributors
      .map(contributor => contributor.devDependencies)
      .reduce((acc, devDependencies) => ([...acc, ...devDependencies]), [])
  ]));
}
