import scaffoldMocha from './mocha';

export default async function ({projectRoot}) {
  const mocha = await scaffoldMocha({projectRoot});

  return {devDependencies: [...mocha.devDependencies]};
}
