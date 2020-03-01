import scaffoldEslint from './eslint';
import scaffoldRemark from './remark';
import scaffoldBanSensitiveFiles from './ban-sensitive-files';

export default async function ({projectRoot, tests, configs, vcs, transpileLint, buildDirectory, eslintConfigs}) {
  const [eslintResult, remarkResult, banSensitiveFilesResult] = await Promise.all([
    configs.eslint && false !== transpileLint
      ? scaffoldEslint({
        projectRoot,
        unitTested: tests.unit,
        config: configs.eslint,
        buildDirectory,
        additionalConfigs: eslintConfigs
      })
      : null,
    scaffoldRemark({projectRoot, config: configs.remark || '@form8ion/remark-lint-preset', vcs}),
    vcs ? scaffoldBanSensitiveFiles() : null
  ]);

  return {
    devDependencies: [
      'lockfile-lint',
      ...eslintResult ? eslintResult.devDependencies : [],
      ...remarkResult ? remarkResult.devDependencies : [],
      ...banSensitiveFilesResult ? banSensitiveFilesResult.devDependencies : []
    ],
    scripts: {
      'lint:lockfile': 'lockfile-lint --path package-lock.json --type npm --validate-https --allowed-hosts npm',
      ...eslintResult && eslintResult.scripts,
      ...remarkResult && remarkResult.scripts,
      ...banSensitiveFilesResult && banSensitiveFilesResult.scripts
    },
    vcsIgnore: {files: [...eslintResult ? eslintResult.vcsIgnore.files : []], directories: []}
  };
}
