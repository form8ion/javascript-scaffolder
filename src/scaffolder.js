import deepmerge from 'deepmerge';
import {scaffoldChoice} from '@form8ion/javascript-core';
import {lift} from '@form8ion/lift-javascript';
import {info} from '@travi/cli-messages';
import {validate} from './options-validator';
import {prompt} from './prompts/questions';
import scaffoldDialect from './dialects';
import scaffoldNpmConfig from './config/npm';
import scaffoldCommitConvention from './commit-convention';
import scaffoldDocumentation from './documentation';
import scaffoldNodeVersion from './node-version';
import buildBadgesDetails from './badges';
import buildVcsIgnoreLists from './vcs-ignore';
import scaffoldPackage from './package';
import buildPackageName from './package-name';
import scaffoldProjectType from './project-type';
import buildDocumentationCommand from './documentation/generation-command';
import {scaffoldVerification} from './verification/verifier';

export async function scaffold(options) {
  info('Initializing JavaScript project');

  const {
    projectRoot,
    projectName,
    visibility,
    license,
    vcs,
    description,
    configs,
    overrides,
    ciServices,
    hosts,
    applicationTypes,
    packageTypes,
    monorepoTypes,
    decisions,
    unitTestFrameworks,
    pathWithinParent,
    registries
  } = validate(options);

  const {
    tests,
    projectType,
    ci,
    chosenHost,
    scope,
    nodeVersionCategory,
    author,
    configureLinting,
    packageManager,
    dialect
  } = await prompt(overrides, ciServices, hosts, visibility, vcs, decisions, configs, pathWithinParent);

  info('Writing project files', {level: 'secondary'});

  const packageName = buildPackageName(projectName, scope);
  const projectTypeResults = await scaffoldProjectType({
    projectType,
    projectRoot,
    projectName,
    packageName,
    packageManager,
    visibility,
    applicationTypes,
    packageTypes,
    monorepoTypes,
    scope,
    tests,
    vcs,
    decisions,
    dialect
  });
  const verificationResults = await scaffoldVerification({
    projectRoot,
    projectType,
    dialect,
    packageManager,
    visibility,
    vcs,
    configs,
    registries,
    configureLinting,
    tests,
    unitTestFrameworks,
    decisions,
    buildDirectory: projectTypeResults.buildDirectory,
    eslintConfigs: projectTypeResults.eslintConfigs
  });
  const [nodeVersion, npmResults, dialectResults] = await Promise.all([
    scaffoldNodeVersion({projectRoot, nodeVersionCategory}),
    scaffoldNpmConfig({projectType, projectRoot, registries}),
    scaffoldDialect({
      dialect,
      configs,
      projectRoot,
      projectType,
      tests,
      buildDirectory: projectTypeResults.buildDirectory,
      testFilenamePattern: verificationResults.testFilenamePattern
    })
  ]);
  const mergedContributions = deepmerge.all([
    ...(await Promise.all([
      scaffoldChoice(
        hosts,
        chosenHost,
        {buildDirectory: `./${projectTypeResults.buildDirectory}`, projectRoot, projectName, nodeVersion}
      ),
      scaffoldChoice(ciServices, ci, {projectRoot, vcs, visibility, projectType, projectName, nodeVersion, tests}),
      scaffoldCommitConvention({projectRoot, projectType, configs, pathWithinParent, packageManager})
    ])),
    projectTypeResults,
    verificationResults,
    npmResults,
    dialectResults
  ]);

  const {homepage: projectHomepage} = await scaffoldPackage({
    projectRoot,
    projectType,
    dialect,
    packageName,
    license,
    vcs,
    author,
    description,
    packageProperties: mergedContributions.packageProperties,
    scripts: mergedContributions.scripts,
    pathWithinParent
  });

  const liftResults = await lift({
    results: deepmerge({devDependencies: ['npm-run-all'], packageManager}, mergedContributions),
    projectRoot,
    configs
  });

  return {
    badges: buildBadgesDetails([mergedContributions, liftResults]),
    documentation: scaffoldDocumentation({projectTypeResults, packageManager}),
    tags: projectTypeResults.tags,
    vcsIgnore: buildVcsIgnoreLists(mergedContributions.vcsIgnore),
    verificationCommand: `${buildDocumentationCommand(packageManager)} && ${packageManager} test`,
    projectDetails: {...projectHomepage && {homepage: projectHomepage}},
    nextSteps: mergedContributions.nextSteps
  };
}
