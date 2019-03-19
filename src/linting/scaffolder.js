import scaffoldEslint from './eslint';
import scaffoldRemark from './remark';

export default async function ({projectRoot, tests, configs}) {
  const [eslintResult, remarkResult] = await Promise.all([
    scaffoldEslint({projectRoot, unitTested: tests.unit, config: configs.eslint}),
    ...configs.remark ? [scaffoldRemark({projectRoot, config: configs.remark})] : []
  ]);

  return {
    devDependencies: [...eslintResult.devDependencies, ...remarkResult ? remarkResult.devDependencies : []],
    scripts: {...eslintResult.scripts, ...remarkResult && remarkResult.scripts},
    vcsIgnore: {files: eslintResult.vcsIgnore.files, directories: []}
  };
}
