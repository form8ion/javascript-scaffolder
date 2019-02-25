import scaffoldUnitTesting from './unit';
import scaffoldIntegrationTesting from './integration';

export default async function ({projectRoot, visibility, tests: {unit, integration}}) {
  const [unitResults, integrationResults] = await Promise.all([
    unit && await scaffoldUnitTesting({projectRoot, visibility}),
    integration && await scaffoldIntegrationTesting({projectRoot})
  ]);

  return {
    devDependencies: [
      ...unitResults ? unitResults.devDependencies : [],
      ...integrationResults ? integrationResults.devDependencies : []
    ]
  };
}
