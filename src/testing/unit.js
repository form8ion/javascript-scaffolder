import deepmerge from 'deepmerge';
import {scaffold as scaffoldMocha} from '@form8ion/mocha-scaffolder';
import scaffoldNyc from '../config/nyc';

export default async function ({projectRoot, visibility, vcs}) {
  const [mocha, nyc] = await Promise.all([scaffoldMocha({projectRoot}), scaffoldNyc({projectRoot, vcs, visibility})]);

  return deepmerge.all([
    {
      devDependencies: 'Public' === visibility ? ['codecov'] : [],
      scripts: {
        'test:unit': 'nyc run-s test:unit:base',
        ...'Public' === visibility && {'coverage:report': 'nyc report --reporter=text-lcov > coverage.lcov && codecov'}
      }
    },
    mocha,
    nyc
  ]);
}
