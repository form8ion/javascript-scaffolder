import scaffoldEslint from './eslint';
import scaffoldRemark from './remark';
import scaffoldBanSensitiveFiles from './ban-sensitive-files';

export default async function ({projectRoot, tests, configs, vcs}) {
  const [eslintResult, remarkResult, banSensitiveFilesResult] = await Promise.all([
    scaffoldEslint({projectRoot, unitTested: tests.unit, config: configs.eslint}),
    ...configs.remark ? [scaffoldRemark({projectRoot, config: configs.remark})] : [null],
    ...vcs ? [scaffoldBanSensitiveFiles()] : [null]
  ]);

  return {
    devDependencies: [
      ...eslintResult.devDependencies,
      ...remarkResult ? remarkResult.devDependencies : [],
      ...banSensitiveFilesResult ? banSensitiveFilesResult.devDependencies : []
    ],
    scripts: {
      ...eslintResult.scripts,
      ...remarkResult && remarkResult.scripts,
      ...banSensitiveFilesResult && banSensitiveFilesResult.scripts
    },
    vcsIgnore: {files: eslintResult.vcsIgnore.files, directories: []}
  };
}
