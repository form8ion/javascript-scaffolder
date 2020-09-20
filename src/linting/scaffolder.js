import deepmerge from 'deepmerge';
import scaffoldEslint from './eslint';
import scaffoldRemark from './remark';
import scaffoldBanSensitiveFiles from './ban-sensitive-files';
import scaffoldLockfileLint from './lockfile';

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
  return deepmerge.all(await Promise.all([
    scaffoldLockfileLint(),
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
  ]));
}
