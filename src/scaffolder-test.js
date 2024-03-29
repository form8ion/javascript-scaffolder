import deepmerge from 'deepmerge';
import * as jsCore from '@form8ion/javascript-core';
import * as jsLifter from '@form8ion/lift-javascript';
import * as commitConvention from '@form8ion/commit-convention';

import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';

import * as prompts from './prompts/questions';
import * as optionsValidator from './options-validator';
import * as dialects from './dialects/scaffolder';
import * as verification from './verification/verifier';
import * as npmConfig from './config/npm';
import * as documentation from './documentation/scaffolder';
import * as nodeVersionScaffolder from './node-version/scaffolder';
import * as badgeDetailsBuilder from './badges';
import * as vcsIgnoresBuilder from './vcs-ignore';
import * as packageScaffolder from './package/scaffolder';
import * as projectTypeScaffolder from './project-type/scaffolder';
import * as packageNameBuilder from './package-name';
import * as documentationCommandBuilder from './documentation/generation-command';
import {scaffold} from './scaffolder';

suite('javascript project scaffolder', () => {
  let sandbox;
  const options = any.simpleObject();
  const ciServices = any.simpleObject();
  const hosts = any.simpleObject();
  const projectRoot = any.string();
  const projectName = any.string();
  const packageName = any.string();
  const pathWithinParent = any.string();
  const registries = any.simpleObject();
  const homepage = any.url();
  const decisions = any.simpleObject();
  const unitTestFrameworks = any.simpleObject();
  const visibility = any.fromList(['Private', 'Public']);
  const version = any.string();
  const commitConventionDevDependencies = any.listOf(any.string);
  const testingNextSteps = any.listOf(any.simpleObject);
  const ciServiceNextSteps = any.listOf(any.simpleObject);
  const projectTypeEslintConfigs = any.listOf(any.string);
  const projectTypeNextSteps = any.listOf(any.simpleObject);
  const hostResults = any.simpleObject();
  const npmResults = any.simpleObject();
  const chosenHost = any.word();
  const chosenDialect = any.word();
  const projectType = any.word();
  const scope = any.word();
  const license = any.string();
  const authorName = any.string();
  const authorEmail = any.string();
  const authorUrl = any.url();
  const integrationTested = any.boolean();
  const unitTested = any.boolean();
  const tests = {unit: unitTested, integration: integrationTested};
  const vcsDetails = any.simpleObject();
  const chosenCiService = any.word();
  const overrides = any.simpleObject();
  const description = any.sentence();
  const babelPresetName = any.string();
  const babelPreset = {name: babelPresetName};
  const configs = {babelPreset, ...any.simpleObject()};
  const nodeVersionCategory = any.word();
  const testFilenamePattern = any.string();
  const verificationResults = {...any.simpleObject(), nextSteps: testingNextSteps, testFilenamePattern};
  const ciServiceResults = {...any.simpleObject(), nextSteps: ciServiceNextSteps};
  const commitConventionResults = {...any.simpleObject(), packageProperties: any.simpleObject()};
  const applicationTypes = any.simpleObject();
  const packageTypes = any.simpleObject();
  const monorepoTypes = any.simpleObject();
  const configureLinting = any.boolean();
  const projectTypeBuildDirectory = any.string();
  const projectTypePackageProperties = any.simpleObject();
  const dialectPackageProperties = any.simpleObject();
  const projectTypeTags = any.listOf(any.word);
  const packageManager = any.word();
  const dialectResults = {
    ...any.simpleObject(),
    eslint: any.simpleObject(),
    packageProperties: dialectPackageProperties
  };
  const projectTypeResults = {
    ...any.simpleObject(),
    buildDirectory: projectTypeBuildDirectory,
    packageProperties: projectTypePackageProperties,
    eslintConfigs: projectTypeEslintConfigs,
    nextSteps: projectTypeNextSteps,
    tags: projectTypeTags
  };
  const contributors = [
    hostResults,
    ciServiceResults,
    commitConventionResults,
    projectTypeResults,
    verificationResults,
    npmResults,
    dialectResults
  ];
  const mergedContributions = deepmerge.all(contributors);
  const packageScaffoldingInputs = {
    projectRoot,
    projectType,
    dialect: chosenDialect,
    packageName,
    license,
    vcs: vcsDetails,
    author: {name: authorName, email: authorEmail, url: authorUrl},
    description,
    packageProperties: {
      ...projectTypePackageProperties,
      ...dialectPackageProperties,
      ...commitConventionResults.packageProperties
    },
    scripts: mergedContributions.scripts,
    pathWithinParent
  };
  const commonPromptAnswers = {
    nodeVersionCategory,
    projectType,
    tests,
    scope,
    author: {name: authorName, email: authorEmail, url: authorUrl},
    ci: chosenCiService,
    chosenHost,
    configureLinting,
    packageManager,
    dialect: chosenDialect
  };
  const liftResults = {...any.simpleObject(), badges: any.simpleObject()};

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(prompts, 'prompt');
    sandbox.stub(optionsValidator, 'validate');
    sandbox.stub(jsCore, 'scaffoldChoice');
    sandbox.stub(jsLifter, 'lift');
    sandbox.stub(dialects, 'default');
    sandbox.stub(verification, 'scaffoldVerification');
    sandbox.stub(npmConfig, 'default');
    sandbox.stub(documentation, 'default');
    sandbox.stub(nodeVersionScaffolder, 'default');
    sandbox.stub(badgeDetailsBuilder, 'default');
    sandbox.stub(vcsIgnoresBuilder, 'default');
    sandbox.stub(commitConvention, 'scaffold');
    sandbox.stub(packageScaffolder, 'default');
    sandbox.stub(packageNameBuilder, 'default');
    sandbox.stub(projectTypeScaffolder, 'default');
    sandbox.stub(documentationCommandBuilder, 'default');

    packageNameBuilder.default.withArgs(projectName, scope).returns(packageName);
    projectTypeScaffolder.default
      .withArgs({
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
        vcs: vcsDetails,
        decisions,
        dialect: chosenDialect
      })
      .resolves(projectTypeResults);
    packageScaffolder.default.withArgs(packageScaffoldingInputs).resolves({...any.simpleObject(), homepage});
    prompts.prompt
      .withArgs(overrides, ciServices, hosts, visibility, vcsDetails, decisions, configs, pathWithinParent)
      .resolves(commonPromptAnswers);
    jsCore.scaffoldChoice
      .withArgs(
        ciServices,
        chosenCiService,
        {
          projectRoot,
          vcs: vcsDetails,
          visibility,
          projectType,
          projectName,
          nodeVersion: version,
          tests
        }
      )
      .resolves(ciServiceResults);
    verification.scaffoldVerification
      .withArgs({
        projectRoot,
        projectType,
        dialect: chosenDialect,
        visibility,
        packageManager,
        vcs: vcsDetails,
        configs,
        registries,
        configureLinting,
        tests,
        unitTestFrameworks,
        decisions,
        buildDirectory: projectTypeBuildDirectory,
        eslintConfigs: projectTypeEslintConfigs
      })
      .resolves(verificationResults);
    dialects.default
      .withArgs({
        projectRoot,
        projectType,
        configs,
        tests,
        buildDirectory: projectTypeBuildDirectory,
        dialect: chosenDialect,
        testFilenamePattern
      })
      .resolves(dialectResults);
    npmConfig.default.resolves(npmResults);
    commitConvention.scaffold
      .withArgs({projectRoot, projectType, configs, pathWithinParent})
      .resolves(commitConventionResults);
    nodeVersionScaffolder.default.withArgs({projectRoot, nodeVersionCategory}).resolves(version);
    optionsValidator.validate
      .withArgs(options)
      .returns({
        visibility,
        projectRoot,
        configs,
        ciServices,
        overrides,
        hosts,
        projectName,
        license,
        vcs: vcsDetails,
        description,
        applicationTypes,
        packageTypes,
        monorepoTypes,
        decisions,
        unitTestFrameworks,
        pathWithinParent,
        registries
      });
    jsLifter.lift
      .withArgs({
        results: deepmerge.all([{devDependencies: ['npm-run-all'], packageManager}, ...contributors]),
        projectRoot,
        configs
      })
      .resolves(liftResults);
  });

  teardown(() => sandbox.restore());

  suite('config files', () => {
    test('that config files are created', async () => {
      jsCore.scaffoldChoice
        .withArgs(
          hosts,
          chosenHost,
          {buildDirectory: `./${projectTypeBuildDirectory}`, projectRoot, projectName, nodeVersion: version}
        )
        .resolves(hostResults);

      await scaffold(options);

      assert.calledWith(
        dialects.default,
        {
          configs,
          projectRoot,
          projectType,
          tests,
          buildDirectory: projectTypeBuildDirectory,
          dialect: chosenDialect,
          testFilenamePattern
        }
      );
      assert.calledWith(npmConfig.default, {projectRoot, projectType, registries});
    });
  });

  suite('data passed downstream', () => {
    setup(
      () => jsCore.scaffoldChoice
        .withArgs(
          hosts,
          chosenHost,
          {buildDirectory: `./${projectTypeBuildDirectory}`, projectRoot, projectName, nodeVersion: version}
        )
        .resolves(hostResults)
    );

    suite('badges', () => {
      test('that badges are provided', async () => {
        const builtBadges = any.simpleObject();
        badgeDetailsBuilder.default.withArgs([mergedContributions, liftResults]).returns(builtBadges);

        const {badges} = await scaffold(options);

        assert.equal(badges, builtBadges);
      });
    });

    suite('vcs ignore', () => {
      test('that ignores are defined', async () => {
        const ignores = any.simpleObject();
        vcsIgnoresBuilder.default.withArgs(mergedContributions.vcsIgnore).returns(ignores);
        commitConvention.scaffold.resolves({devDependencies: commitConventionDevDependencies});

        const {vcsIgnore} = await scaffold(options);

        assert.equal(vcsIgnore, ignores);
      });
    });

    suite('verification', () => {
      test('that the verification command enhances documentation before verifying', async () => {
        const documentationGenerationCommand = any.string();
        documentationCommandBuilder.default.withArgs(packageManager).returns(documentationGenerationCommand);

        const {verificationCommand} = await scaffold(options);

        assert.equal(verificationCommand, `${documentationGenerationCommand} && ${packageManager} test`);
      });
    });

    suite('project details', () => {
      test('that details are passed along', async () => {
        const {projectDetails} = await scaffold(options);

        assert.equal(projectDetails.homepage, homepage);
      });

      test('that details are not passed along if not defined', async () => {
        packageScaffolder.default.withArgs(packageScaffoldingInputs).resolves(any.simpleObject());

        const {projectDetails} = await scaffold(options);

        assert.isUndefined(projectDetails.homepage);
      });
    });

    suite('documentation', () => {
      test('that appropriate documentation is passed along', async () => {
        const docs = any.simpleObject();
        documentation.default.withArgs({projectTypeResults, packageManager}).returns(docs);
        optionsValidator.validate
          .returns({projectRoot, projectName, visibility, vcs: {}, configs: {}, ciServices, scope});

        const {documentation: documentationContent, tags} = await scaffold(options);

        assert.equal(documentationContent, docs);
        assert.equal(tags, projectTypeTags);
      });
    });

    suite('next steps', () => {
      test('that next steps are included from the project-type scaffolder', async () => {
        const {nextSteps} = await scaffold(options);

        assert.deepEqual(nextSteps, [...ciServiceNextSteps, ...projectTypeNextSteps, ...testingNextSteps]);
      });
    });
  });
});
