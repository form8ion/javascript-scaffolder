import scaffoldMocha from './mocha';
import scaffoldNyc from '../config/nyc';

export default async function ({projectRoot, visibility}) {
  const [mocha, nyc] = await Promise.all([scaffoldMocha({projectRoot}), scaffoldNyc({projectRoot})]);

  return {
    devDependencies: [
      ...mocha.devDependencies,
      ...nyc.devDependencies,
      '@travi/any',
      ...'Public' === visibility ? ['codecov'] : []
    ]
  };
}
