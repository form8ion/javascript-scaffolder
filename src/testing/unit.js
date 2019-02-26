import {writeFile} from 'mz/fs';
import scaffoldMocha from './mocha';

export default async function ({projectRoot, visibility}) {
  const [mocha] = await Promise.all([
    scaffoldMocha({projectRoot}),
    writeFile(`${projectRoot}/.nycrc`, JSON.stringify({reporter: ['lcov', 'text-summary'], exclude: ['test/']}))
  ]);

  return {
    devDependencies: [...mocha.devDependencies, ...'Public' === visibility ? ['codecov', 'nyc', '@travi/any'] : []]
  };
}
