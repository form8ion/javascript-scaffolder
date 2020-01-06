import scaffoldUnitTesting from './unit';

export default async function ({projectRoot, visibility, tests: {unit, integration}, vcs}) {
  const unitResults = unit ? await scaffoldUnitTesting({projectRoot, visibility, vcs}) : undefined;

  return {
    devDependencies: [
      ...(unit || integration) ? ['@travi/any'] : [],
      ...unitResults ? unitResults.devDependencies : []
    ],
    scripts: {...unitResults && unitResults.scripts},
    vcsIgnore: {
      files: [...unitResults ? unitResults.vcsIgnore.files : []],
      directories: [...unitResults ? unitResults.vcsIgnore.directories : []]
    },
    eslintConfigs: unitResults ? unitResults.eslintConfigs : []
  };
}
