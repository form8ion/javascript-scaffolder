import deepmerge from 'deepmerge';
import scaffoldEslint from './eslint';
import scaffoldRemark from './remark';
import scaffoldBanSensitiveFiles from './ban-sensitive-files';
import scaffoldLockfileLint from './lockfile';

export default async function ({
  projectRoot,
  projectType,
  packageManager,
  tests,
  configs,
  vcs,
  transpileLint,
  buildDirectory,
  eslint
}) {
  return deepmerge.all(await Promise.all([
    scaffoldLockfileLint({projectRoot, packageManager}),
    configs.eslint && false !== transpileLint
      ? scaffoldEslint({
        projectRoot,
        unitTested: tests.unit,
        config: configs.eslint,
        buildDirectory,
        additionalConfiguration: eslint
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
