import scaffoldUnitTesting from './unit';

export default async function ({projectRoot, tests: {unit}}) {
  return {
    devDependencies: [
      ...unit ? (await scaffoldUnitTesting({projectRoot})).devDependencies : []
    ]
  };
}
