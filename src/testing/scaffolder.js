import scaffoldUnitTesting from './unit';

export default async function ({projectRoot, visibility, tests: {unit}}) {
  return {
    devDependencies: [
      ...unit ? (await scaffoldUnitTesting({projectRoot, visibility})).devDependencies : []
    ]
  };
}
