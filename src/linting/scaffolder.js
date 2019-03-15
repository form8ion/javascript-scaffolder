import scaffoldEslint from './eslint';

export default async function ({projectRoot, tests, configs}) {
  const eslintResult = await scaffoldEslint({projectRoot, unitTested: tests.unit, config: configs.eslint});

  return {
    devDependencies: eslintResult.devDependencies,
    vcsIgnore: {files: eslintResult.vcsIgnore.files}
  };
}
