import scaffoldUnitTesting from './unit';
import scaffoldIntegrationTesting from './integration';

export default async function ({projectRoot, visibility, tests: {unit, integration}}) {
  return {
    devDependencies: [
      ...unit ? (await scaffoldUnitTesting({projectRoot, visibility})).devDependencies : [],
      ...integration ? (await scaffoldIntegrationTesting({projectRoot})).devDependencies : []
    ]
  };
}
