import scaffoldUnitTesting from './unit';
import scaffoldIntegrationTesting from './integration';

export default async function ({projectRoot, visibility, tests: {unit, integration}, vcs}) {
  const [unitResults, integrationResults] = await Promise.all([
    unit ? scaffoldUnitTesting({projectRoot, visibility, vcs}) : undefined,
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
    },
    vcsIgnore: {
      files: [...unitResults ? unitResults.vcsIgnore.files : []],
      directories: [...unitResults ? unitResults.vcsIgnore.directories : []]
    }
  };
}
