import scaffoldMocha from './mocha';

export default async function ({projectRoot, visibility}) {
  const mocha = await scaffoldMocha({projectRoot});

  return {
    devDependencies: [...mocha.devDependencies, ...'Public' === visibility ? ['codecov', 'nyc', '@travi/any'] : []]
  };
}
