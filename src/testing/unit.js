import scaffoldMocha from './mocha';
import scaffoldNyc from '../config/nyc';

export default async function ({projectRoot, visibility, vcs}) {
  const [mocha, nyc] = await Promise.all([scaffoldMocha({projectRoot}), scaffoldNyc({projectRoot, vcs, visibility})]);

  return {
    devDependencies: [
      ...mocha.devDependencies,
      ...nyc.devDependencies,
      ...'Public' === visibility ? ['codecov'] : []
    ],
    scripts: {
      'test:unit': 'nyc run-s test:unit:base',
      ...mocha.scripts,
      ...'Public' === visibility && {'coverage:report': 'nyc report --reporter=text-lcov > coverage.lcov && codecov'}
    },
    vcsIgnore: nyc.vcsIgnore
  };
}
