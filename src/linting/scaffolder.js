import deepmerge from 'deepmerge';
import scaffoldEslint from './eslint';
import scaffoldRemark from './remark';
import scaffoldBanSensitiveFiles from './ban-sensitive-files';

export default async function ({
  projectRoot,
  projectType,
  tests,
  configs,
  vcs,
  transpileLint,
  buildDirectory,
  eslintConfigs
}) {
  const [eslintResult, remarkResult, banSensitiveFilesResult] = await Promise.all([
    configs.eslint && false !== transpileLint
      ? scaffoldEslint({
        projectRoot,
        unitTested: tests.unit,
        config: configs.eslint,
        buildDirectory,
        additionalConfigs: eslintConfigs
      })
      : {},
    scaffoldRemark({
      projectRoot,
      projectType,
      vcs,
      transpileLint,
      config: configs.remark || '@form8ion/remark-lint-preset'
    }),
    vcs ? scaffoldBanSensitiveFiles() : {}
  ]);

  return deepmerge.all([
    {
      devDependencies: ['lockfile-lint'],
      scripts: {
        'lint:lockfile': 'lockfile-lint --path package-lock.json --type npm --validate-https --allowed-hosts npm'
      }
    },
    eslintResult,
    remarkResult,
    banSensitiveFilesResult
  ]);
}
