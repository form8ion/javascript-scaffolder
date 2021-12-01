import deepmerge from 'deepmerge';

import scaffoldTesting from './testing';
import scaffoldLinting from './linting';

export async function scaffoldVerification({
  projectRoot,
  projectType,
  dialect,
  visibility,
  packageManager,
  vcs,
  configs,
  registries,
  configureLinting,
  tests,
  unitTestFrameworks,
  decisions,
  buildDirectory,
  eslintConfigs
}) {
  const testingResults = await scaffoldTesting({
    projectRoot,
    tests,
    visibility,
    vcs,
    unitTestFrameworks,
    decisions,
    dialect
  });

  const lintingResults = await scaffoldLinting({
    projectRoot,
    projectType,
    packageManager,
    dialect,
    configs,
    registries,
    vcs,
    configureLinting,
    buildDirectory,
    eslint: deepmerge(
      testingResults.eslint,
      {configs: deepmerge(testingResults.eslintConfigs, eslintConfigs)}
    )
  });

  return deepmerge(testingResults, lintingResults);
}
