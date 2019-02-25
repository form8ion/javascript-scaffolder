import scaffoldUnitTesting from './unit';

export default async function ({projectRoot}) {
  const unitTesting = await scaffoldUnitTesting({projectRoot});

  return {devDependencies: [...unitTesting.devDependencies]};
}
