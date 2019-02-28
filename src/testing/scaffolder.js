import scaffoldUnitTesting from './unit';
import scaffoldIntegrationTesting from './integration';

export default async function ({projectRoot, visibility, tests: {unit, integration}}) {
  const [unitResults, integrationResults] = await Promise.all([
    unit ? scaffoldUnitTesting({projectRoot, visibility}) : undefined,
    integration ? scaffoldIntegrationTesting({projectRoot}) : undefined
  ]);

  return {
    devDependencies: [
      '@travi/any',
      ...unitResults ? unitResults.devDependencies : [],
      ...integrationResults ? integrationResults.devDependencies : []
    ],
    scripts: {
      ...unitResults && unitResults.scripts,
      ...integrationResults && integrationResults.scripts
    }
  };
}
