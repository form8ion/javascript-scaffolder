import deepmerge from 'deepmerge';
import {scaffoldChoice} from '@form8ion/javascript-core';
import {lift} from '@form8ion/lift-javascript';
import {info} from '@travi/cli-messages';
import {questionNames as commonQuestionNames} from '@travi/language-scaffolder-prompts';
import {validate} from './options-validator';
import {prompt} from './prompts/questions';
import scaffoldTesting from './testing';
import scaffoldBabel from './config/babel';
import scaffoldLinting from './linting';
import scaffoldNpmConfig from './config/npm';
import scaffoldCommitConvention from './commit-convention';
import scaffoldDocumentation from './documentation';
import scaffoldNodeVersion from './node-version';
import {questionNames} from './prompts/question-names';
import buildBadgesDetails from './badges';
import buildVcsIgnoreLists from './vcs-ignore';
import scaffoldPackage from './package';
import buildPackageName from './package-name';
import scaffoldProjectType from './project-type';
import buildDocumentationCommand from './documentation/generation-command';

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
    decisions,
    unitTestFrameworks,
    pathWithinParent,
    registries
  } = validate(options);

  const {
    [commonQuestionNames.UNIT_TESTS]: unitTested,
    [commonQuestionNames.INTEGRATION_TESTS]: integrationTested,
    [questionNames.PROJECT_TYPE]: projectType,
    [commonQuestionNames.CI_SERVICE]: ci,
    [questionNames.HOST]: chosenHost,
    [questionNames.SCOPE]: scope,
    [questionNames.NODE_VERSION_CATEGORY]: nodeVersionCategory,
    [questionNames.AUTHOR_NAME]: authorName,
    [questionNames.AUTHOR_EMAIL]: authorEmail,
    [questionNames.AUTHOR_URL]: authorUrl,
    [questionNames.TRANSPILE_LINT]: transpileLint,
    [questionNames.PACKAGE_MANAGER]: packageManager
  } = await prompt(overrides, ciServices, hosts, visibility, vcs, decisions, pathWithinParent);

  info('Writing project files', {level: 'secondary'});

  const packageName = buildPackageName(projectName, scope);
  const tests = {unit: unitTested, integration: integrationTested};
  const projectTypeResults = await scaffoldProjectType({
    projectType,
    projectRoot,
    projectName,
    packageName,
    packageManager,
    transpileLint,
    visibility,
    applicationTypes,
    packageTypes,
    scope,
    tests,
    vcs,
    decisions
  });
  const testingResults = await scaffoldTesting({projectRoot, tests, visibility, vcs, unitTestFrameworks, decisions});
  const [nodeVersion, npmResults] = await Promise.all([
    scaffoldNodeVersion({projectRoot, nodeVersionCategory}),
    scaffoldNpmConfig({projectType, projectRoot, registries})
  ]);
  const contributors = [
    ...(await Promise.all([
      scaffoldChoice(
        hosts,
        chosenHost,
        {buildDirectory: `./${projectTypeResults.buildDirectory}`, projectRoot, projectName, nodeVersion}
      ),
      scaffoldLinting({
        configs,
        projectRoot,
        projectType,
        packageManager,
        registries,
        vcs,
        transpileLint,
        buildDirectory: projectTypeResults.buildDirectory,
        eslint: deepmerge(
          testingResults.eslint,
          {configs: deepmerge(testingResults.eslintConfigs, projectTypeResults.eslintConfigs)}
        )
      }),
      scaffoldChoice(ciServices, ci, {projectRoot, vcs, visibility, projectType, projectName, nodeVersion, tests}),
      scaffoldBabel({
        preset: configs.babelPreset,
        projectRoot,
        transpileLint,
        tests,
        buildDirectory: projectTypeResults.buildDirectory
      }),
      scaffoldCommitConvention({projectRoot, configs, pathWithinParent, packageManager})
    ])),
    projectTypeResults,
    testingResults,
    npmResults
  ];

  const {homepage: projectHomepage} = await scaffoldPackage({
    projectRoot,
    projectType,
    contributors,
    packageName,
    license,
    vcs,
    author: {name: authorName, email: authorEmail, url: authorUrl},
    description,
    packageProperties: projectTypeResults.packageProperties,
    pathWithinParent
  });

  await lift({
    results: deepmerge.all([{devDependencies: ['npm-run-all'], packageManager}, ...contributors]),
    projectRoot,
    configs
  });

  return {
    badges: buildBadgesDetails(contributors),
    documentation: scaffoldDocumentation({projectTypeResults, packageManager}),
    tags: projectTypeResults.tags,
    vcsIgnore: buildVcsIgnoreLists(contributors),
    verificationCommand: `${buildDocumentationCommand(packageManager)} && ${packageManager} test`,
    projectDetails: {...projectHomepage && {homepage: projectHomepage}},
    nextSteps: contributors
      .reduce((acc, contributor) => (contributor.nextSteps ? [...acc, ...contributor.nextSteps] : acc), [])
  };
}
