import deepmerge from 'deepmerge';
import scaffoldEslint from './eslint';
import scaffoldRemark from './remark';
import scaffoldBanSensitiveFiles from './ban-sensitive-files';
import scaffoldLockfileLint from './lockfile';

export default async function ({
  projectRoot,
  projectType,
  packageManager,
  dialect,
  registries,
  configs,
  vcs,
  configureLinting,
  buildDirectory,
  eslint
}) {
  return deepmerge.all(await Promise.all([
    scaffoldLockfileLint({projectRoot, packageManager, registries}),
    configs.eslint && configureLinting
      ? scaffoldEslint({
        projectRoot,
        config: configs.eslint,
        buildDirectory,
        additionalConfiguration: eslint
      })
      : {},
    scaffoldRemark({
      projectRoot,
      projectType,
      dialect,
      vcs,
      config: configs.remark || '@form8ion/remark-lint-preset'
    }),
    vcs ? scaffoldBanSensitiveFiles() : {}
  ]));
}
